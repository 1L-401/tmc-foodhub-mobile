import type { AddOnItem, CartItemModel } from '@/components/cart/types';

export const DEFAULT_DELIVERY_ADDRESS = {
  label: 'Delivering to',
  address: 'Home • 123 Quezon Avenue',
} as const;

export const DEFAULT_PAYMENT_METHOD = 'GCash •••• 9876';
export const DEFAULT_DELIVERY_FEE = 3;
export const DEFAULT_DISCOUNT = 5;

export const MOCK_CART_ITEMS: CartItemModel[] = [
  {
    id: '1',
    name: 'Grilled Steak',
    description: 'Medium Rare',
    price: 12,
    quantity: 1,
    image: 'https://via.placeholder.com/100/F4F4F4/1A1A1A?text=Steak',
  },
  {
    id: '2',
    name: 'Black Iced Coffee',
    description: 'No Sugar',
    price: 3,
    quantity: 1,
    image: 'https://via.placeholder.com/100/F4F4F4/1A1A1A?text=Coffee',
  },
];

export const MOCK_ADD_ONS: AddOnItem[] = [
  {
    id: 'a1',
    name: 'Double Cheeseburger',
    price: 5,
    image: 'https://via.placeholder.com/120/F4F4F4/1A1A1A?text=Burger',
  },
  {
    id: 'a2',
    name: 'French Fries',
    price: 4,
    image: 'https://via.placeholder.com/120/F4F4F4/1A1A1A?text=Fries',
  },
  {
    id: 'a3',
    name: 'Sushi',
    price: 9,
    image: 'https://via.placeholder.com/120/F4F4F4/1A1A1A?text=Sushi',
  },
];
