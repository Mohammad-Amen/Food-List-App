// Live inbox + owned lists, shared by all tabs (one Firestore listener each).
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { watchInbox, watchOwnedLists } from './api';
import { useMe } from './auth';
import type { ShoppingList } from './types';

interface ListsState {
  inbox: ShoppingList[];
  sent: ShoppingList[];
  drafts: ShoppingList[];
  unseenCount: number;
  /** People I've exchanged lists with, most recent first. */
  recentPeople: { uid: string; username: string }[];
  ready: boolean;
}

const ListsContext = createContext<ListsState | null>(null);

const newestFirst = (key: 'sentAt' | 'updatedAt') => (a: ShoppingList, b: ShoppingList) =>
  (b[key] ?? 0) - (a[key] ?? 0);

export function ListsProvider({ children }: { children: ReactNode }) {
  const me = useMe();
  const [inbox, setInbox] = useState<ShoppingList[] | null>(null);
  const [owned, setOwned] = useState<ShoppingList[] | null>(null);

  useEffect(() => watchInbox(me.uid, setInbox, () => setInbox([])), [me.uid]);
  useEffect(() => watchOwnedLists(me.uid, setOwned, () => setOwned([])), [me.uid]);

  const value = useMemo<ListsState>(() => {
    const inboxSorted = [...(inbox ?? [])].sort(newestFirst('sentAt'));
    const sent = (owned ?? []).filter((l) => l.status !== 'draft').sort(newestFirst('sentAt'));
    const drafts = (owned ?? []).filter((l) => l.status === 'draft').sort(newestFirst('updatedAt'));

    const people = new Map<string, { uid: string; username: string; at: number }>();
    const remember = (uid: string | null, username: string | null, at: number | null) => {
      if (!uid || !username || uid === me.uid) return;
      const prev = people.get(uid);
      if (!prev || (at ?? 0) > prev.at) people.set(uid, { uid, username, at: at ?? 0 });
    };
    inboxSorted.forEach((l) => remember(l.ownerId, l.ownerName, l.sentAt));
    sent.forEach((l) => remember(l.recipientId, l.recipientName, l.sentAt));

    return {
      inbox: inboxSorted,
      sent,
      drafts,
      unseenCount: inboxSorted.filter((l) => l.status === 'sent').length,
      recentPeople: [...people.values()].sort((a, b) => b.at - a.at).map(({ uid, username }) => ({ uid, username })),
      ready: inbox !== null && owned !== null,
    };
  }, [inbox, owned, me.uid]);

  return <ListsContext.Provider value={value}>{children}</ListsContext.Provider>;
}

export function useLists() {
  const v = useContext(ListsContext);
  if (!v) throw new Error('useLists outside ListsProvider');
  return v;
}
