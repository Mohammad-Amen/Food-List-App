// Single source of truth for who may do what to a list.
// firestore.rules mirrors these exact rules on the server — keep them in sync.
//
//   draft → only the owner can edit items.
//   sent  → owner AND recipient can add / edit / delete items.
//   seen  → nobody can add / edit / delete items; both can still tick items off.
//
// Only the recipient can move a list from "sent" to "seen", and it can't be undone.

import type { ShoppingList } from './types';

type ListLike = Pick<ShoppingList, 'ownerId' | 'recipientId' | 'status'>;

export function isParticipant(list: ListLike, uid: string): boolean {
  return list.ownerId === uid || (list.recipientId !== null && list.recipientId === uid);
}

/** Add, edit or delete items. */
export function canEditItems(list: ListLike, uid: string): boolean {
  if (list.status === 'draft') return list.ownerId === uid;
  if (list.status === 'sent') return isParticipant(list, uid);
  return false;
}

/** Tick / untick an item as bought. */
export function canCheckItems(list: ListLike, uid: string): boolean {
  return isParticipant(list, uid);
}

export function canRenameList(list: ListLike, uid: string): boolean {
  return list.ownerId === uid && list.status !== 'seen';
}

export function canSend(list: ListLike, uid: string): boolean {
  return list.ownerId === uid && list.status === 'draft';
}

export function canMarkSeen(list: ListLike, uid: string): boolean {
  return list.status === 'sent' && list.recipientId === uid;
}

export function canDeleteList(list: ListLike, uid: string): boolean {
  return list.ownerId === uid && list.status === 'draft';
}
