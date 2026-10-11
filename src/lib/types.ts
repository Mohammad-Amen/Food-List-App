export type ListStatus = 'draft' | 'sent' | 'seen';

export interface UserProfile {
  uid: string;
  username: string; // e.g. "أمي#4821"
  usernameLower: string;
  displayName: string;
}

export interface ShoppingList {
  id: string;
  title: string;
  ownerId: string;
  ownerName: string;
  recipientId: string | null;
  recipientName: string | null;
  status: ListStatus;
  createdAt: number;
  updatedAt: number;
  sentAt: number | null;
  seenAt: number | null;
}

export interface ListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  note: string;
  category: string;
  checked: boolean;
  checkedBy: string | null;
  addedBy: string;
  addedByName: string;
  createdAt: number;
}
