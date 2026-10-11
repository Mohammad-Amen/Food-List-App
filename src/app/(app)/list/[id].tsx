import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, SectionList, Share, StyleSheet, Text, TextInput, View } from 'react-native';

import { StatusBadge } from '../../../components/ListCard';
import { Banner, Button, Chip, colors, Empty, font, Loading, Screen, text } from '../../../components/ui';
import {
  addItem,
  copyList,
  deleteDraft,
  deleteItem,
  markSeen,
  renameList,
  setItemChecked,
  watchItems,
  watchList,
} from '../../../lib/api';
import { useMe } from '../../../lib/auth';
import { NAME_MAX_LEN, SUGGESTIONS, TITLE_MAX_LEN } from '../../../lib/catalog';
import { formatQty, groupByCategory, listToText } from '../../../lib/format';
import {
  canCheckItems,
  canDeleteList,
  canEditItems,
  canMarkSeen,
  canRenameList,
  canSend,
} from '../../../lib/permissions';
import { errorMessage, formatDate, t } from '../../../lib/strings';
import type { ListItem, ShoppingList } from '../../../lib/types';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const me = useMe();
  const [list, setList] = useState<ShoppingList | null | undefined>(undefined);
  const [items, setItems] = useState<ListItem[]>([]);

  useEffect(() => watchList(id, setList, () => setList(null)), [id]);
  useEffect(() => watchItems(id, setItems, () => setItems([])), [id]);

  const sections = useMemo(() => groupByCategory(items), [items]);

  if (list === undefined) return <Loading />;
  if (list === null) return <Empty text={t.listNotFound} />;

  const editable = canEditItems(list, me.uid);
  const checkable = canCheckItems(list, me.uid);
  const isOwner = list.ownerId === me.uid;
  const done = items.filter((i) => i.checked).length;

  const fail = (e: unknown) => Alert.alert(t.error, errorMessage(e));

  function toggle(item: ListItem) {
    if (!checkable) return;
    setItemChecked(list!.id, item.id, !item.checked, me.uid).catch(fail);
  }

  function confirmDeleteItem(item: ListItem) {
    if (!editable) return;
    Alert.alert(item.name, t.deleteItemConfirm, [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: () => deleteItem(list!.id, item.id).catch(fail) },
    ]);
  }

  function confirmMarkSeen() {
    Alert.alert(t.markSeenConfirmTitle, t.markSeenConfirm, [
      { text: t.cancel, style: 'cancel' },
      { text: t.confirm, onPress: () => markSeen(list!.id).catch(fail) },
    ]);
  }

  function confirmDeleteList() {
    Alert.alert(list!.title, t.deleteListConfirm, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.delete,
        style: 'destructive',
        onPress: () =>
          deleteDraft(list!.id)
            .then(() => router.back())
            .catch(fail),
      },
    ]);
  }

  async function duplicate() {
    try {
      const newId = await copyList(me, list!, items);
      router.replace(`/list/${newId}`);
    } catch (e) {
      fail(e);
    }
  }

  const banner =
    list.status === 'seen'
      ? { text: t.lockedSeen, tone: 'warn' as const }
      : list.status === 'draft'
        ? { text: t.draftHint, tone: 'info' as const }
        : { text: isOwner ? t.sentHintOwner : t.sentHintRecipient, tone: 'info' as const };

  const header = (
    <View style={{ gap: 14, marginBottom: 8 }}>
      <View style={styles.titleRow}>
        <TitleEditor list={list} canRename={canRenameList(list, me.uid)} />
        <StatusBadge list={list} mode={list.status === 'draft' ? 'draft' : isOwner ? 'sent' : 'inbox'} />
      </View>
      {list.status !== 'draft' ? (
        <Text style={text.muted}>
          {isOwner ? `${t.to}: ${list.recipientName}` : `${t.from}: ${list.ownerName}`}
          {'  ·  '}
          {formatDate(list.sentAt)}
        </Text>
      ) : null}
      <Banner text={banner.text} tone={banner.tone} />
      {items.length > 0 ? <ProgressBar done={done} total={items.length} /> : null}
      {editable ? <QuickAdd listId={list.id} existing={items} /> : null}
    </View>
  );

  const footer = (
    <View style={{ gap: 12, marginTop: 20 }}>
      {canMarkSeen(list, me.uid) ? <Button title={t.markSeen} onPress={confirmMarkSeen} /> : null}
      {canSend(list, me.uid) ? (
        <Button
          title={`📤 ${t.send}`}
          disabled={items.length === 0}
          onPress={() => router.push({ pathname: '/send', params: { listId: list.id } })}
        />
      ) : null}
      {items.length > 0 ? (
        <Button
          variant="secondary"
          title={t.shareText}
          onPress={() => Share.share({ message: listToText(list.title, items) })}
        />
      ) : null}
      {list.status !== 'draft' && items.length > 0 ? (
        <>
          <Button
            variant="secondary"
            title={t.sendCopy}
            onPress={() => router.push({ pathname: '/send', params: { listId: list.id, copy: '1' } })}
          />
          <Button variant="secondary" title={t.duplicate} onPress={duplicate} />
        </>
      ) : null}
      {canDeleteList(list, me.uid) ? <Button variant="danger" title={t.deleteList} onPress={confirmDeleteList} /> : null}
    </View>
  );

  return (
    <Screen>
      <Stack.Screen options={{ title: list.title }} />
      <SectionList
        sections={sections}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        ListEmptyComponent={<Empty text={t.emptyItems} />}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <Text style={styles.section}>
            {section.category.emoji} {section.category.label}
          </Text>
        )}
        renderItem={({ item }) => (
          <ItemRow
            item={item}
            checkable={checkable}
            editable={editable}
            showAuthor={list.status !== 'draft'}
            onToggle={() => toggle(item)}
            onEdit={() => router.push({ pathname: '/item', params: { listId: list.id, itemId: item.id } })}
            onDelete={() => confirmDeleteItem(item)}
          />
        )}
      />
    </Screen>
  );
}

function TitleEditor({ list, canRename }: { list: ShoppingList; canRename: boolean }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(list.title);

  if (!editing) {
    return (
      <Pressable style={{ flex: 1 }} disabled={!canRename} onPress={() => (setValue(list.title), setEditing(true))}>
        <Text style={text.title}>
          {list.title} {canRename ? <Text style={{ fontSize: font.md }}>✏️</Text> : null}
        </Text>
      </Pressable>
    );
  }
  const save = () => {
    setEditing(false);
    if (value.trim() && value.trim() !== list.title) {
      renameList(list.id, value).catch((e) => Alert.alert(t.error, errorMessage(e)));
    }
  };
  return (
    <TextInput
      style={[styles.quickInput, { flex: 1 }]}
      value={value}
      onChangeText={setValue}
      onBlur={save}
      onSubmitEditing={save}
      maxLength={TITLE_MAX_LEN}
      autoFocus
    />
  );
}

function ProgressBar({ done, total }: { done: number; total: number }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={text.body}>{t.progress(done, total)}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${(done / total) * 100}%` }]} />
      </View>
    </View>
  );
}

function QuickAdd({ listId, existing }: { listId: string; existing: ListItem[] }) {
  const me = useMe();
  const [name, setName] = useState('');
  const fail = (e: unknown) => Alert.alert(t.error, errorMessage(e));

  const add = () => {
    const n = name.trim();
    if (!n) return;
    const known = SUGGESTIONS.find((s) => s.name === n);
    setName('');
    addItem(listId, me, {
      name: n,
      quantity: 1,
      unit: known?.unit ?? 'حبة',
      note: '',
      category: known?.category ?? 'other',
    }).catch(fail);
  };

  const have = new Set(existing.map((i) => i.name));
  const chips = SUGGESTIONS.filter((s) => !have.has(s.name));

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput
          style={[styles.quickInput, { flex: 1 }]}
          placeholder={t.itemName}
          placeholderTextColor={colors.muted}
          value={name}
          onChangeText={setName}
          onSubmitEditing={add}
          returnKeyType="done"
          submitBehavior="submit"
          maxLength={NAME_MAX_LEN}
        />
        <Button title={t.add} onPress={add} disabled={!name.trim()} />
      </View>
      <Button
        variant="ghost"
        title={t.addWithDetails}
        onPress={() => router.push({ pathname: '/item', params: { listId, name: name.trim() } })}
      />
      {chips.length > 0 ? (
        <>
          <Text style={text.muted}>{t.quickAdd}</Text>
          <ScrollView horizontal contentContainerStyle={{ gap: 8 }} showsHorizontalScrollIndicator={false}>
            {chips.map((s) => (
              <Chip
                key={s.name}
                label={`＋ ${s.name}`}
                onPress={() =>
                  addItem(listId, me, { name: s.name, quantity: 1, unit: s.unit, note: '', category: s.category }).catch(
                    fail,
                  )
                }
              />
            ))}
          </ScrollView>
        </>
      ) : null}
    </View>
  );
}

function ItemRow({
  item,
  checkable,
  editable,
  showAuthor,
  onToggle,
  onEdit,
  onDelete,
}: {
  item: ListItem;
  checkable: boolean;
  editable: boolean;
  showAuthor: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={[styles.row, item.checked && { backgroundColor: colors.bg }]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.checked, disabled: !checkable }}
        onPress={onToggle}
        disabled={!checkable}
        hitSlop={12}
        style={[styles.box, item.checked && styles.boxChecked]}
      >
        {item.checked ? <Text style={styles.tick}>✓</Text> : null}
      </Pressable>
      <Pressable style={{ flex: 1, gap: 2 }} onPress={editable ? onEdit : onToggle} onLongPress={onDelete}>
        <Text style={[styles.itemName, item.checked && styles.itemChecked]}>{item.name}</Text>
        {item.note ? <Text style={text.muted}>📝 {item.note}</Text> : null}
        {showAuthor ? (
          <Text style={[text.muted, { fontSize: 14 }]}>
            {t.addedBy}: {item.addedByName}
          </Text>
        ) : null}
      </Pressable>
      <Text style={[styles.qty, item.checked && styles.itemChecked]}>
        {formatQty(item.quantity)} {item.unit}
      </Text>
      {editable ? (
        <Pressable onPress={onDelete} hitSlop={12} accessibilityLabel={t.delete}>
          <Text style={{ fontSize: 20 }}>🗑️</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  section: { fontSize: font.md, fontWeight: '700', color: colors.muted, marginTop: 18, marginBottom: 8, textAlign: 'left' },
  track: { height: 12, borderRadius: 6, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary },
  quickInput: {
    minHeight: 56,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    fontSize: font.lg,
    color: colors.text,
    textAlign: 'left',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  box: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: { backgroundColor: colors.primary },
  tick: { color: colors.primaryText, fontSize: 22, fontWeight: '900' },
  itemName: { fontSize: font.lg, fontWeight: '600', color: colors.text, textAlign: 'left' },
  itemChecked: { color: colors.checked, textDecorationLine: 'line-through' },
  qty: { fontSize: font.md, fontWeight: '700', color: colors.text },
});
