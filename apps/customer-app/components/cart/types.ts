export interface CartItemModel {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
}

export interface AddOnItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

export type AddressLabel = 'Home' | 'Work' | 'Other';

export interface SavedAddress {
  id: string;
  label: AddressLabel;
  street: string;
  fullAddress: string;
  isDefault: boolean;
  unitFloor?: string;
  city?: string;
  deliveryNotes?: string;
}
