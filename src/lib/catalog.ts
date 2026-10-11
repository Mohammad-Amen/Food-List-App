export const UNITS = ['حبة', 'كيلو', 'غرام', 'لتر', 'علبة', 'كيس', 'ربطة', 'كرتونة'] as const;

export const CATEGORIES = [
  { id: 'veg', label: 'خضار وفواكه', emoji: '🥬' },
  { id: 'meat', label: 'لحوم ودجاج', emoji: '🍗' },
  { id: 'dairy', label: 'ألبان وأجبان', emoji: '🧀' },
  { id: 'bakery', label: 'مخبوزات', emoji: '🍞' },
  { id: 'pantry', label: 'مواد تموينية', emoji: '🍚' },
  { id: 'drinks', label: 'مشروبات', emoji: '🧃' },
  { id: 'cleaning', label: 'منظفات', emoji: '🧼' },
  { id: 'other', label: 'أخرى', emoji: '📦' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export const CATEGORY_IDS: readonly string[] = CATEGORIES.map((c) => c.id);

export function categoryOf(id: string) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}

/** Quick-add chips: tap to add a common item with sensible defaults. */
export const SUGGESTIONS: { name: string; unit: string; category: CategoryId }[] = [
  { name: 'خبز', unit: 'ربطة', category: 'bakery' },
  { name: 'حليب', unit: 'لتر', category: 'dairy' },
  { name: 'لبن', unit: 'علبة', category: 'dairy' },
  { name: 'بيض', unit: 'كرتونة', category: 'dairy' },
  { name: 'جبنة', unit: 'علبة', category: 'dairy' },
  { name: 'بندورة', unit: 'كيلو', category: 'veg' },
  { name: 'خيار', unit: 'كيلو', category: 'veg' },
  { name: 'بصل', unit: 'كيلو', category: 'veg' },
  { name: 'بطاطا', unit: 'كيلو', category: 'veg' },
  { name: 'ليمون', unit: 'كيلو', category: 'veg' },
  { name: 'موز', unit: 'كيلو', category: 'veg' },
  { name: 'دجاج', unit: 'كيلو', category: 'meat' },
  { name: 'لحمة', unit: 'كيلو', category: 'meat' },
  { name: 'أرز', unit: 'كيس', category: 'pantry' },
  { name: 'سكر', unit: 'كيس', category: 'pantry' },
  { name: 'زيت', unit: 'لتر', category: 'pantry' },
  { name: 'شاي', unit: 'علبة', category: 'drinks' },
  { name: 'قهوة', unit: 'علبة', category: 'drinks' },
  { name: 'ماء', unit: 'كرتونة', category: 'drinks' },
  { name: 'مناديل', unit: 'علبة', category: 'cleaning' },
  { name: 'صابون', unit: 'حبة', category: 'cleaning' },
];

export const NAME_MAX_LEN = 60;
export const NOTE_MAX_LEN = 200;
export const TITLE_MAX_LEN = 60;
export const QTY_MAX = 9999;
