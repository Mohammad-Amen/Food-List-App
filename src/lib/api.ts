import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

import { getAuthInstance, getDb } from './firebase';
import type { ListItem, ShoppingList, UserProfile } from './types';
import { formatHandle, handleKey, handleToEmail, normalizeName, randomTag } from './username';

// ---------- Auth ----------

export class AppError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

// While true, the auth listener leaves profile loading to signUp (which writes the doc itself).
let signUpInProgress = false;
export const isSignUpInProgress = () => signUpInProgress;

export async function signUp(displayName: string, password: string): Promise<UserProfile> {
  signUpInProgress = true;
  try {
    return await signUpInner(normalizeName(displayName), password);
  } finally {
    signUpInProgress = false;
  }
}

async function signUpInner(name: string, password: string): Promise<UserProfile> {
  // Collisions are rare; retry with a fresh tag if the handle is taken.
  for (let attempt = 0; attempt < 8; attempt++) {
    const username = formatHandle(name, randomTag());
    const email = handleToEmail(username)!;
    try {
      const cred = await createUserWithEmailAndPassword(getAuthInstance(), email, password);
      const profile: UserProfile = {
        uid: cred.user.uid,
        username,
        usernameLower: username.toLowerCase(),
        displayName: name,
      };
      await setDoc(doc(getDb(), 'users', cred.user.uid), {
        username: profile.username,
        usernameLower: profile.usernameLower,
        displayName: profile.displayName,
        createdAt: Date.now(),
      });
      return profile;
    } catch (e: any) {
      if (e?.code === 'auth/email-already-in-use') continue;
      throw e;
    }
  }
  throw new AppError('app/no-free-tag');
}

// Lets the app show the "your handle is…" welcome screen once after sign-up.
let justSignedUp = false;
export function markJustSignedUp() {
  justSignedUp = true;
}
export function consumeJustSignedUp() {
  const v = justSignedUp;
  justSignedUp = false;
  return v;
}

export async function signIn(handle: string, password: string): Promise<void> {
  const email = handleToEmail(handle);
  if (!email) throw new AppError('app/bad-handle');
  await signInWithEmailAndPassword(getAuthInstance(), email, password);
}

export function signOut() {
  return fbSignOut(getAuthInstance());
}

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(getDb(), 'users', uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return { uid, username: d.username, usernameLower: d.usernameLower, displayName: d.displayName };
}

export async function findUserByHandle(handle: string): Promise<UserProfile | null> {
  const key = handleKey(handle);
  if (!key) throw new AppError('app/bad-handle');
  const q = query(collection(getDb(), 'users'), where('usernameLower', '==', key), limit(1));
  const res = await getDocs(q);
  if (res.empty) return null;
  const d = res.docs[0];
  return { uid: d.id, ...(d.data() as Omit<UserProfile, 'uid'>) };
}

// ---------- Lists ----------

function toList(id: string, d: any): ShoppingList {
  return {
    id,
    title: d.title ?? '',
    ownerId: d.ownerId,
    ownerName: d.ownerName ?? '',
    recipientId: d.recipientId ?? null,
    recipientName: d.recipientName ?? null,
    status: d.status,
    createdAt: d.createdAt ?? 0,
    updatedAt: d.updatedAt ?? 0,
    sentAt: d.sentAt ?? null,
    seenAt: d.seenAt ?? null,
  };
}

function toItem(id: string, d: any): ListItem {
  return {
    id,
    name: d.name,
    quantity: d.quantity ?? 1,
    unit: d.unit ?? '',
    note: d.note ?? '',
    category: d.category ?? 'other',
    checked: !!d.checked,
    checkedBy: d.checkedBy ?? null,
    addedBy: d.addedBy,
    addedByName: d.addedByName ?? '',
    createdAt: d.createdAt ?? 0,
  };
}

/** Lists I created (drafts + sent). */
export function watchOwnedLists(uid: string, cb: (lists: ShoppingList[]) => void, onError?: (e: Error) => void) {
  const q = query(collection(getDb(), 'lists'), where('ownerId', '==', uid));
  return onSnapshot(q, (s) => cb(s.docs.map((d) => toList(d.id, d.data()))), onError);
}

/** Lists other people sent to me. */
export function watchInbox(uid: string, cb: (lists: ShoppingList[]) => void, onError?: (e: Error) => void) {
  const q = query(collection(getDb(), 'lists'), where('recipientId', '==', uid));
  return onSnapshot(q, (s) => cb(s.docs.map((d) => toList(d.id, d.data()))), onError);
}

export function watchList(listId: string, cb: (list: ShoppingList | null) => void, onError?: (e: Error) => void) {
  return onSnapshot(
    doc(getDb(), 'lists', listId),
    (s) => cb(s.exists() ? toList(s.id, s.data()) : null),
    onError,
  );
}

export function watchItems(listId: string, cb: (items: ListItem[]) => void, onError?: (e: Error) => void) {
  return onSnapshot(
    collection(getDb(), 'lists', listId, 'items'),
    (s) => cb(s.docs.map((d) => toItem(d.id, d.data())).sort((a, b) => a.createdAt - b.createdAt)),
    onError,
  );
}

export async function getList(listId: string): Promise<ShoppingList | null> {
  const s = await getDoc(doc(getDb(), 'lists', listId));
  return s.exists() ? toList(s.id, s.data()) : null;
}

export async function getItems(listId: string): Promise<ListItem[]> {
  const s = await getDocs(collection(getDb(), 'lists', listId, 'items'));
  return s.docs.map((d) => toItem(d.id, d.data())).sort((a, b) => a.createdAt - b.createdAt);
}

export async function getItem(listId: string, itemId: string): Promise<ListItem | null> {
  const s = await getDoc(doc(getDb(), 'lists', listId, 'items', itemId));
  return s.exists() ? toItem(s.id, s.data()) : null;
}

export async function createList(me: UserProfile, title: string): Promise<string> {
  const now = Date.now();
  const ref = await addDoc(collection(getDb(), 'lists'), {
    title: title.trim(),
    ownerId: me.uid,
    ownerName: me.username,
    recipientId: null,
    recipientName: null,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    sentAt: null,
    seenAt: null,
  });
  return ref.id;
}

export function renameList(listId: string, title: string) {
  return updateDoc(doc(getDb(), 'lists', listId), { title: title.trim(), updatedAt: Date.now() });
}

export function sendList(listId: string, to: UserProfile) {
  const now = Date.now();
  return updateDoc(doc(getDb(), 'lists', listId), {
    status: 'sent',
    recipientId: to.uid,
    recipientName: to.username,
    sentAt: now,
    updatedAt: now,
  });
}

export function markSeen(listId: string) {
  const now = Date.now();
  return updateDoc(doc(getDb(), 'lists', listId), { status: 'seen', seenAt: now, updatedAt: now });
}

export async function deleteDraft(listId: string) {
  const db = getDb();
  const items = await getDocs(collection(db, 'lists', listId, 'items'));
  const batch = writeBatch(db);
  items.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  await deleteDoc(doc(db, 'lists', listId));
}

/**
 * Copies a list (with all its items, unticked) into a new list I own.
 * With `to`, the copy is sent straight away; otherwise it becomes a draft.
 */
export async function copyList(me: UserProfile, source: ShoppingList, items: ListItem[], to?: UserProfile) {
  const db = getDb();
  const now = Date.now();
  const listRef = doc(collection(db, 'lists'));
  // The list doc must exist before its items, because item rules read it.
  await setDoc(listRef, {
    title: source.title,
    ownerId: me.uid,
    ownerName: me.username,
    recipientId: to ? to.uid : null,
    recipientName: to ? to.username : null,
    status: to ? 'sent' : 'draft',
    createdAt: now,
    updatedAt: now,
    sentAt: to ? now : null,
    seenAt: null,
  });
  const batch = writeBatch(db);
  items.forEach((it, i) => {
    batch.set(doc(collection(listRef, 'items')), {
      name: it.name,
      quantity: it.quantity,
      unit: it.unit,
      note: it.note,
      category: it.category,
      checked: false,
      checkedBy: null,
      addedBy: me.uid,
      addedByName: me.username,
      createdAt: now + i,
    });
  });
  await batch.commit();
  return listRef.id;
}

// ---------- Items ----------

export type ItemInput = Pick<ListItem, 'name' | 'quantity' | 'unit' | 'note' | 'category'>;

export function addItem(listId: string, me: UserProfile, input: ItemInput) {
  return addDoc(collection(getDb(), 'lists', listId, 'items'), {
    name: input.name.trim(),
    quantity: input.quantity,
    unit: input.unit,
    note: input.note.trim(),
    category: input.category,
    checked: false,
    checkedBy: null,
    addedBy: me.uid,
    addedByName: me.username,
    createdAt: Date.now(),
  });
}

export function updateItem(listId: string, itemId: string, input: ItemInput) {
  return updateDoc(doc(getDb(), 'lists', listId, 'items', itemId), {
    name: input.name.trim(),
    quantity: input.quantity,
    unit: input.unit,
    note: input.note.trim(),
    category: input.category,
  });
}

export function setItemChecked(listId: string, itemId: string, checked: boolean, uid: string) {
  return updateDoc(doc(getDb(), 'lists', listId, 'items', itemId), {
    checked,
    checkedBy: checked ? uid : null,
  });
}

export function deleteItem(listId: string, itemId: string) {
  return deleteDoc(doc(getDb(), 'lists', listId, 'items', itemId));
}
