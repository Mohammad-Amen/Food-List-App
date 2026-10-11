// Runs against the Firestore emulator: npm run test:rules
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, test } from 'node:test';

import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, limit, query, setDoc, updateDoc, where } from 'firebase/firestore';

const OWNER = 'owner';
const RECIPIENT = 'recipient';
const STRANGER = 'stranger';
const now = Date.now();

let env;

const db = (uid) => env.authenticatedContext(uid).firestore();

const listData = (status, extra = {}) => ({
  title: 'أغراض',
  ownerId: OWNER,
  ownerName: 'owner#0001',
  recipientId: status === 'draft' ? null : RECIPIENT,
  recipientName: status === 'draft' ? null : 'recipient#0002',
  status,
  createdAt: now,
  updatedAt: now,
  sentAt: status === 'draft' ? null : now,
  seenAt: status === 'seen' ? now : null,
  ...extra,
});

const itemData = (addedBy, extra = {}) => ({
  name: 'خبز',
  quantity: 1,
  unit: 'ربطة',
  note: '',
  category: 'bakery',
  checked: false,
  checkedBy: null,
  addedBy,
  addedByName: `${addedBy}#0000`,
  createdAt: now,
  ...extra,
});

async function seed(status) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    const fs = ctx.firestore();
    await setDoc(doc(fs, 'lists/L'), listData(status));
    await setDoc(doc(fs, 'lists/L/items/I'), itemData(OWNER));
  });
}

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-foodlist',
    firestore: { rules: readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8') },
  });
});
after(() => env.cleanup());
beforeEach(() => env.clearFirestore());

// ---------- users ----------

test('users: create own profile, no edits, lookup only with limit 1', async () => {
  const profile = { username: 'أمي#4821', usernameLower: 'أمي#4821', displayName: 'أمي', createdAt: now };
  await assertSucceeds(setDoc(doc(db(OWNER), 'users', OWNER), profile));
  await assertFails(setDoc(doc(db(OWNER), 'users', STRANGER), profile));
  await assertFails(updateDoc(doc(db(OWNER), 'users', OWNER), { username: 'x#0000' }));
  const users = collection(db(STRANGER), 'users');
  await assertSucceeds(getDocs(query(users, where('usernameLower', '==', 'أمي#4821'), limit(1))));
  await assertFails(getDocs(users));
});

// ---------- lists ----------

test('lists: owner creates drafts; can create pre-sent copies; never for someone else', async () => {
  await assertSucceeds(setDoc(doc(db(OWNER), 'lists/A'), listData('draft')));
  await assertSucceeds(setDoc(doc(db(OWNER), 'lists/B'), listData('sent')));
  await assertFails(setDoc(doc(db(OWNER), 'lists/C'), listData('seen')));
  await assertFails(setDoc(doc(db(STRANGER), 'lists/D'), listData('draft')));
  await assertFails(setDoc(doc(db(OWNER), 'lists/E'), listData('sent', { recipientId: OWNER })));
});

test('lists: only participants can read', async () => {
  await seed('sent');
  await assertSucceeds(getDoc(doc(db(OWNER), 'lists/L')));
  await assertSucceeds(getDoc(doc(db(RECIPIENT), 'lists/L')));
  await assertFails(getDoc(doc(db(STRANGER), 'lists/L')));
  await assertFails(getDoc(doc(db(STRANGER), 'lists/L/items/I')));
  await assertSucceeds(getDocs(query(collection(db(RECIPIENT), 'lists'), where('recipientId', '==', RECIPIENT))));
  await assertFails(getDocs(collection(db(RECIPIENT), 'lists')));
});

test('lists: owner sends a draft (not to themselves)', async () => {
  await seed('draft');
  const send = (to) => ({ status: 'sent', recipientId: to, recipientName: 'x#0001', sentAt: now, updatedAt: now });
  await assertFails(updateDoc(doc(db(OWNER), 'lists/L'), send(OWNER)));
  await assertFails(updateDoc(doc(db(STRANGER), 'lists/L'), send(RECIPIENT)));
  await assertSucceeds(updateDoc(doc(db(OWNER), 'lists/L'), send(RECIPIENT)));
});

test('lists: only the recipient marks seen, and it is one-way', async () => {
  await seed('sent');
  const seen = { status: 'seen', seenAt: now, updatedAt: now };
  await assertFails(updateDoc(doc(db(OWNER), 'lists/L'), seen));
  await assertSucceeds(updateDoc(doc(db(RECIPIENT), 'lists/L'), seen));
  await assertFails(updateDoc(doc(db(RECIPIENT), 'lists/L'), { status: 'sent', updatedAt: now }));
  await assertFails(updateDoc(doc(db(OWNER), 'lists/L'), { status: 'sent', updatedAt: now }));
  await assertFails(updateDoc(doc(db(OWNER), 'lists/L'), { title: 'جديد', updatedAt: now }));
});

test('lists: recipient cannot rename or redirect a list', async () => {
  await seed('sent');
  await assertFails(updateDoc(doc(db(RECIPIENT), 'lists/L'), { title: 'x', updatedAt: now }));
  await assertFails(updateDoc(doc(db(RECIPIENT), 'lists/L'), { recipientId: STRANGER }));
  await assertSucceeds(updateDoc(doc(db(OWNER), 'lists/L'), { title: 'جديد', updatedAt: now }));
});

test('lists: only drafts can be deleted', async () => {
  await seed('sent');
  await assertFails(deleteDoc(doc(db(OWNER), 'lists/L')));
  await seed('draft');
  await assertFails(deleteDoc(doc(db(STRANGER), 'lists/L')));
  await assertSucceeds(deleteDoc(doc(db(OWNER), 'lists/L/items/I')));
  await assertSucceeds(deleteDoc(doc(db(OWNER), 'lists/L')));
});

// ---------- items ----------

test('items: draft is owner-only', async () => {
  await seed('draft');
  await assertSucceeds(setDoc(doc(db(OWNER), 'lists/L/items/N'), itemData(OWNER)));
  await assertFails(setDoc(doc(db(RECIPIENT), 'lists/L/items/N2'), itemData(RECIPIENT)));
});

test('items: while sent, both add / edit / delete; addedBy must be yourself', async () => {
  await seed('sent');
  await assertSucceeds(setDoc(doc(db(RECIPIENT), 'lists/L/items/R'), itemData(RECIPIENT)));
  await assertFails(setDoc(doc(db(RECIPIENT), 'lists/L/items/R2'), itemData(OWNER)));
  await assertFails(setDoc(doc(db(STRANGER), 'lists/L/items/S'), itemData(STRANGER)));
  await assertSucceeds(updateDoc(doc(db(RECIPIENT), 'lists/L/items/I'), { quantity: 3 }));
  await assertSucceeds(updateDoc(doc(db(OWNER), 'lists/L/items/R'), { name: 'خبز عربي' }));
  await assertFails(updateDoc(doc(db(RECIPIENT), 'lists/L/items/I'), { addedBy: RECIPIENT }));
  await assertFails(updateDoc(doc(db(RECIPIENT), 'lists/L/items/I'), { quantity: -1 }));
  await assertFails(updateDoc(doc(db(RECIPIENT), 'lists/L/items/I'), { category: 'nope' }));
  await assertSucceeds(deleteDoc(doc(db(RECIPIENT), 'lists/L/items/I')));
});

test('items: once seen, nobody edits, adds or deletes — but both can tick', async () => {
  await seed('seen');
  for (const uid of [OWNER, RECIPIENT]) {
    await assertFails(setDoc(doc(db(uid), 'lists/L/items/N'), itemData(uid)));
    await assertFails(updateDoc(doc(db(uid), 'lists/L/items/I'), { quantity: 5 }));
    await assertFails(updateDoc(doc(db(uid), 'lists/L/items/I'), { name: 'x', checked: true, checkedBy: uid }));
    await assertFails(deleteDoc(doc(db(uid), 'lists/L/items/I')));
    await assertSucceeds(updateDoc(doc(db(uid), 'lists/L/items/I'), { checked: true, checkedBy: uid }));
    await assertSucceeds(updateDoc(doc(db(uid), 'lists/L/items/I'), { checked: false, checkedBy: null }));
  }
  await assertFails(updateDoc(doc(db(RECIPIENT), 'lists/L/items/I'), { checked: true, checkedBy: OWNER }));
  await assertFails(updateDoc(doc(db(STRANGER), 'lists/L/items/I'), { checked: true, checkedBy: STRANGER }));
});
