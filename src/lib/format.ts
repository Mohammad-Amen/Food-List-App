// Pure helpers (no React Native imports) so they can be unit-tested with Node.
import { CATEGORIES, categoryOf } from './catalog';
import type { ListItem } from './types';

export function formatQty(q: number): string {
  return Number.isInteger(q) ? String(q) : String(Math.round(q * 100) / 100);
}

/** Groups items by category, in catalog order; unchecked items first within each group. */
export function groupByCategory(items: ListItem[]) {
  return CATEGORIES.map((c) => ({
    category: c,
    data: items
      .filter((i) => categoryOf(i.category).id === c.id)
      .sort((a, b) => Number(a.checked) - Number(b.checked) || a.createdAt - b.createdAt),
  })).filter((g) => g.data.length > 0);
}

/** Plain-text version of a list, for sharing over WhatsApp etc. */
export function listToText(title: string, items: ListItem[]): string {
  const lines = groupByCategory(items).flatMap((g) => [
    `${g.category.emoji} ${g.category.label}`,
    ...g.data.map((i) => {
      const mark = i.checked ? '✅' : '▫️';
      const note = i.note ? ` (${i.note})` : '';
      return `${mark} ${i.name} — ${formatQty(i.quantity)} ${i.unit}${note}`;
    }),
    '',
  ]);
  return [`🛒 ${title}`, '', ...lines].join('\n').trim();
}

/** Step for the quantity +/- buttons: halves for weights/volumes, whole units otherwise. */
export function qtyStep(unit: string): number {
  return unit === 'كيلو' || unit === 'لتر' ? 0.5 : 1;
}

export function clampQty(q: number, step: number): number {
  return Math.min(9999, Math.max(step, Math.round(q / step) * step));
}
