import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Banner, Button, Chip, colors, Field, font, Loading, text } from '../../components/ui';
import { addItem, getItem, updateItem } from '../../lib/api';
import { useMe } from '../../lib/auth';
import { CATEGORIES, NAME_MAX_LEN, NOTE_MAX_LEN, SUGGESTIONS, UNITS } from '../../lib/catalog';
import { clampQty, formatQty, qtyStep } from '../../lib/format';
import { errorMessage, t } from '../../lib/strings';
import { toLatinDigits } from '../../lib/username';

export default function ItemEditorScreen() {
  const { listId, itemId, name: initialName } = useLocalSearchParams<{
    listId: string;
    itemId?: string;
    name?: string;
  }>();
  const me = useMe();
  const known = SUGGESTIONS.find((s) => s.name === initialName);

  const [loading, setLoading] = useState(!!itemId);
  const [name, setName] = useState(initialName ?? '');
  const [quantity, setQuantity] = useState(1);
  const [qtyText, setQtyText] = useState('1');
  const [unit, setUnit] = useState<string>(known?.unit ?? UNITS[0]);
  const [category, setCategory] = useState<string>(known?.category ?? 'other');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!itemId) return;
    getItem(listId, itemId)
      .then((it) => {
        if (it) {
          setName(it.name);
          setQuantity(it.quantity);
          setQtyText(formatQty(it.quantity));
          setUnit(it.unit);
          setCategory(it.category);
          setNote(it.note);
        }
      })
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [listId, itemId]);

  if (loading) return <Loading />;

  const step = qtyStep(unit);
  const setQty = (q: number) => {
    const v = clampQty(q, step);
    setQuantity(v);
    setQtyText(formatQty(v));
  };

  async function save() {
    if (!name.trim()) return;
    setBusy(true);
    const input = { name, quantity, unit, note, category };
    try {
      if (itemId) await updateItem(listId, itemId, input);
      else await addItem(listId, me, input);
      router.back();
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 22 }} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: itemId ? t.editItem : t.addItem }} />
      {error ? <Banner text={error} tone="danger" /> : null}

      <Field label={t.itemName} value={name} onChangeText={setName} maxLength={NAME_MAX_LEN} autoFocus={!itemId} />

      <View style={{ gap: 8 }}>
        <Text style={styles.label}>{t.quantity}</Text>
        <View style={styles.stepper}>
          <Pressable style={styles.stepBtn} onPress={() => setQty(quantity - step)} accessibilityLabel="-">
            <Text style={styles.stepText}>−</Text>
          </Pressable>
          <TextInput
            style={styles.qtyInput}
            keyboardType="decimal-pad"
            value={qtyText}
            onChangeText={(s) => {
              setQtyText(s);
              const n = parseFloat(toLatinDigits(s).replace('٫', '.').replace(',', '.'));
              if (n > 0) setQuantity(Math.min(9999, n));
            }}
            onBlur={() => setQtyText(formatQty(quantity))}
          />
          <Pressable style={styles.stepBtn} onPress={() => setQty(quantity + step)} accessibilityLabel="+">
            <Text style={styles.stepText}>+</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={styles.label}>{t.unit}</Text>
        <View style={styles.wrap}>
          {UNITS.map((u) => (
            <Chip key={u} label={u} selected={unit === u} onPress={() => setUnit(u)} />
          ))}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={styles.label}>{t.category}</Text>
        <View style={styles.wrap}>
          {CATEGORIES.map((c) => (
            <Chip
              key={c.id}
              label={`${c.emoji} ${c.label}`}
              selected={category === c.id}
              onPress={() => setCategory(c.id)}
            />
          ))}
        </View>
      </View>

      <Field
        label={t.note}
        placeholder={t.notePlaceholder}
        value={note}
        onChangeText={setNote}
        maxLength={NOTE_MAX_LEN}
        multiline
      />

      <Text style={text.muted}>
        {name.trim() ? `${name.trim()} — ${formatQty(quantity)} ${unit}` : ''}
      </Text>
      <Button title={itemId ? t.save : t.add} onPress={save} loading={busy} disabled={!name.trim()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: font.md, fontWeight: '600', color: colors.text, textAlign: 'left' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { color: colors.primaryText, fontSize: 32, fontWeight: '700', lineHeight: 36 },
  qtyInput: {
    flex: 1,
    minHeight: 60,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.card,
    fontSize: font.xl,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.text,
  },
});
