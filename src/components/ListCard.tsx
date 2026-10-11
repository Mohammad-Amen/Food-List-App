import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDate, t } from '../lib/strings';
import type { ShoppingList } from '../lib/types';
import { Badge, colors, font } from './ui';

export function ListCard({ list, mode }: { list: ShoppingList; mode: 'inbox' | 'sent' | 'draft' }) {
  const unseen = mode === 'inbox' && list.status === 'sent';
  const who =
    mode === 'inbox' ? `${t.from}: ${list.ownerName}` : mode === 'sent' ? `${t.to}: ${list.recipientName}` : null;
  const date = mode === 'draft' ? list.updatedAt : list.sentAt;

  return (
    <Pressable
      onPress={() => router.push(`/list/${list.id}`)}
      style={({ pressed }) => [styles.card, unseen && styles.unseen, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={1}>
          {list.title || t.newList}
        </Text>
        <StatusBadge list={list} mode={mode} />
      </View>
      {who ? <Text style={styles.meta}>{who}</Text> : null}
      <Text style={styles.date}>{formatDate(date)}</Text>
    </Pressable>
  );
}

export function StatusBadge({ list, mode }: { list: ShoppingList; mode: 'inbox' | 'sent' | 'draft' }) {
  if (list.status === 'draft') return <Badge text={t.statusDraft} color={colors.muted} bg={colors.border} />;
  if (list.status === 'seen') return <Badge text={t.statusSeen} />;
  return mode === 'inbox' ? (
    <Badge text={t.statusSent} color={colors.primaryText} bg={colors.danger} />
  ) : (
    <Badge text={t.statusSentOwner} color={colors.warn} bg={colors.warnSoft} />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 2,
    borderColor: colors.border,
  },
  unseen: { borderColor: colors.danger },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { fontSize: font.lg, fontWeight: '700', color: colors.text, flex: 1, textAlign: 'left' },
  meta: { fontSize: font.md, color: colors.text, textAlign: 'left' },
  date: { fontSize: font.sm, color: colors.muted, textAlign: 'left' },
});
