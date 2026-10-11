// Discord-style handles: "<name>#<4 digits>", e.g. "أمي#4821".
// Firebase Auth needs an email, so each handle maps to a hidden, deterministic
// fake email. Auth then guarantees that no two users share a handle.

export const NAME_MIN = 2;
export const NAME_MAX = 12;
export const EMAIL_DOMAIN = 'users.foodlist.app';

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

export function validateName(name: string): 'tooShort' | 'tooLong' | 'invalidChars' | null {
  const n = normalizeName(name);
  const len = [...n].length;
  if (len < NAME_MIN) return 'tooShort';
  if (len > NAME_MAX) return 'tooLong';
  // Letters (any language), digits, spaces, _ . -
  if (!/^[\p{L}\p{M}\p{N} _.\-]+$/u.test(n)) return 'invalidChars';
  return null;
}

export function randomTag(random: () => number = Math.random): string {
  return String(Math.floor(random() * 10000)).padStart(4, '0');
}

export function formatHandle(name: string, tag: string): string {
  return `${normalizeName(name)}#${tag}`;
}

/** Splits "name#1234" into its parts, or returns null if it isn't a valid handle. */
export function parseHandle(handle: string): { name: string; tag: string } | null {
  // Accept Arabic-Indic digits too, since the keyboard may type them.
  const h = toLatinDigits(handle.trim());
  const m = /^(.+)#(\d{4})$/u.exec(h);
  if (!m) return null;
  const name = normalizeName(m[1]);
  if (validateName(name)) return null;
  return { name, tag: m[2] };
}

export function handleKey(handle: string): string | null {
  const p = parseHandle(handle);
  return p ? formatHandle(p.name, p.tag).toLowerCase() : null;
}

/** Deterministic, ASCII-only email for a handle (Arabic names are hex-encoded). */
export function handleToEmail(handle: string): string | null {
  const p = parseHandle(handle);
  if (!p) return null;
  const bytes = new TextEncoder().encode(p.name.toLowerCase());
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `u${hex}.${p.tag}@${EMAIL_DOMAIN}`;
}

/** Inverse of handleToEmail (returns the lower-cased handle). */
export function emailToHandle(email: string): string | null {
  const m = /^u([0-9a-f]+)\.(\d{4})@/.exec(email);
  if (!m || m[1].length % 2) return null;
  const bytes = new Uint8Array(m[1].match(/../g)!.map((h) => parseInt(h, 16)));
  return formatHandle(new TextDecoder().decode(bytes), m[2]);
}

export function toLatinDigits(s: string): string {
  return s
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}
