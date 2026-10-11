// Shared, parent-friendly UI: big text, big tap targets, high contrast.
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';

export const colors = {
  bg: '#F6F7F4',
  card: '#FFFFFF',
  text: '#1D2420',
  muted: '#5E6A63',
  border: '#D9DED9',
  primary: '#2E7D4F',
  primaryText: '#FFFFFF',
  primarySoft: '#E3F1E8',
  danger: '#B3261E',
  dangerSoft: '#FBE9E7',
  warn: '#8A5A00',
  warnSoft: '#FFF4D6',
  checked: '#9AA59F',
};

export const font = { sm: 16, md: 19, lg: 22, xl: 28, xxl: 34 };

export function Screen({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[{ flex: 1, backgroundColor: colors.bg }, style]}>{children}</View>;
}

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}) {
  const v = buttonVariants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: v.bg, borderColor: v.border },
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <Text style={[styles.buttonText, { color: v.text }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const buttonVariants: Record<ButtonVariant, { bg: string; text: string; border: string }> = {
  primary: { bg: colors.primary, text: colors.primaryText, border: colors.primary },
  secondary: { bg: colors.card, text: colors.primary, border: colors.primary },
  danger: { bg: colors.card, text: colors.danger, border: colors.danger },
  ghost: { bg: 'transparent', text: colors.primary, border: 'transparent' },
};

export function Field({ label, hint, ...props }: TextInputProps & { label: string; hint?: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.muted} {...props} style={[styles.input, props.style]} />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function Banner({ text, tone = 'info' }: { text: string; tone?: 'info' | 'warn' | 'danger' }) {
  const bg = tone === 'warn' ? colors.warnSoft : tone === 'danger' ? colors.dangerSoft : colors.primarySoft;
  const fg = tone === 'warn' ? colors.warn : tone === 'danger' ? colors.danger : colors.primary;
  return (
    <View style={[styles.banner, { backgroundColor: bg }]}>
      <Text style={[styles.bannerText, { color: fg }]}>{text}</Text>
    </View>
  );
}

export function Badge({ text, color = colors.primary, bg = colors.primarySoft }: { text: string; color?: string; bg?: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <View style={{ padding: 32, alignItems: 'center' }}>
      <Text style={{ fontSize: font.md, color: colors.muted, textAlign: 'center', lineHeight: 30 }}>{text}</Text>
    </View>
  );
}

export function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && { backgroundColor: colors.primary, borderColor: colors.primary }]}
    >
      <Text style={[styles.chipText, selected && { color: colors.primaryText }]}>{label}</Text>
    </Pressable>
  );
}

export const text: Record<'title' | 'body' | 'muted', TextStyle> = {
  title: { fontSize: font.xl, fontWeight: '700', color: colors.text, textAlign: 'left' },
  body: { fontSize: font.md, color: colors.text, textAlign: 'left' },
  muted: { fontSize: font.sm, color: colors.muted, textAlign: 'left' },
};

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: font.lg, fontWeight: '700' },
  label: { fontSize: font.md, fontWeight: '600', color: colors.text, textAlign: 'left' },
  hint: { fontSize: font.sm, color: colors.muted, textAlign: 'left', lineHeight: 24 },
  input: {
    minHeight: 56,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    fontSize: font.lg,
    color: colors.text,
    textAlign: 'left', // RN flips left↔right under RTL
  },
  banner: { borderRadius: 12, padding: 14 },
  bannerText: { fontSize: font.sm, lineHeight: 26, fontWeight: '600', textAlign: 'left' },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  badgeText: { fontSize: 14, fontWeight: '700' },
  chip: {
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: { fontSize: font.sm, color: colors.text, fontWeight: '600' },
});
