import type { CartItemModel } from '@/components/cart';
import type { CheckoutAddress, CheckoutPaymentOption } from '@/components/checkout';

export const CHECKOUT_DELIVERY_ADDRESS: CheckoutAddress = {
  label: 'Delivering to',
  address: '123 Quezon Avenue, Unit 4B, Brgy. South Triangle, Quezon City, Metro Manila',
};

export const CHECKOUT_SPECIAL_INSTRUCTIONS_PLACEHOLDER =
  'e.g. Gate code is 1234, leave at the lobby table...';

export const CHECKOUT_ITEMS: CartItemModel[] = [
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

export const CHECKOUT_PAYMENT_OPTIONS: CheckoutPaymentOption[] = [
  {
    id: 'gcash',
    label: 'GCash',
    subtitle: '•••• 9876',
    icon: 'gcash',
  },
  {
    id: 'maya',
    label: 'Maya',
    subtitle: 'john.doe@maya',
    icon: 'maya',
  },
  {
    id: 'card',
    label: 'Credit or Debit Card',
    subtitle: 'Add a card to continue',
    icon: 'card',
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    subtitle: 'Pay when food arrives',
    icon: 'cod',
  },
];

export const CHECKOUT_SUBTOTAL = 15;
export const CHECKOUT_DELIVERY_FEE = 3;
export const CHECKOUT_DISCOUNT = 5;
export const CHECKOUT_TOTAL = 15;
