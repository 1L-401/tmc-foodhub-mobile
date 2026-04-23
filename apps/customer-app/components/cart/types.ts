export interface SelectedVariation {
  name: string;
  price: number;
}

export interface SelectedAddon {
  name: string;
  price: number;
}

export interface CartItemModel {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
  restaurantId?: string | number;
  restaurantName?: string;
  selectedVariation?: SelectedVariation;
  selectedAddons?: SelectedAddon[];
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
