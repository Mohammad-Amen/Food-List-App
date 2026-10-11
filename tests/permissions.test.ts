/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  canCheckItems,
  canDeleteList,
  canEditItems,
  canMarkSeen,
  canRenameList,
  canSend,
} from '../src/lib/permissions.ts';
import type { ListStatus } from '../src/lib/types.ts';

const OWNER = 'owner';
const RECIPIENT = 'recipient';
const STRANGER = 'stranger';

const list = (status: ListStatus) => ({
  ownerId: OWNER,
  recipientId: status === 'draft' ? null : RECIPIENT,
  status,
});

test('draft: only the owner edits, ticks, renames, sends and deletes', () => {
  const l = list('draft');
  assert.equal(canEditItems(l, OWNER), true);
  assert.equal(canCheckItems(l, OWNER), true);
  assert.equal(canRenameList(l, OWNER), true);
  assert.equal(canSend(l, OWNER), true);
  assert.equal(canDeleteList(l, OWNER), true);
  for (const uid of [RECIPIENT, STRANGER]) {
    assert.equal(canEditItems(l, uid), false);
    assert.equal(canCheckItems(l, uid), false);
    assert.equal(canSend(l, uid), false);
  }
});

test('sent: owner and recipient both edit items; only recipient marks seen', () => {
  const l = list('sent');
  assert.equal(canEditItems(l, OWNER), true);
  assert.equal(canEditItems(l, RECIPIENT), true);
  assert.equal(canEditItems(l, STRANGER), false);
  assert.equal(canMarkSeen(l, RECIPIENT), true);
  assert.equal(canMarkSeen(l, OWNER), false);
  assert.equal(canSend(l, OWNER), false);
  assert.equal(canDeleteList(l, OWNER), false);
  assert.equal(canRenameList(l, OWNER), true);
  assert.equal(canRenameList(l, RECIPIENT), false);
});

test('seen: items locked for everyone, but both can still tick', () => {
  const l = list('seen');
  for (const uid of [OWNER, RECIPIENT]) {
    assert.equal(canEditItems(l, uid), false);
    assert.equal(canCheckItems(l, uid), true);
    assert.equal(canRenameList(l, uid), false);
    assert.equal(canMarkSeen(l, uid), false);
  }
  assert.equal(canCheckItems(l, STRANGER), false);
});
