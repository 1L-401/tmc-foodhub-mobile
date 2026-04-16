export type CheckoutPaymentId = 'gcash' | 'maya' | 'card' | 'cod';

export type CheckoutPaymentIcon = CheckoutPaymentId;

export interface CheckoutPaymentOption {
  id: CheckoutPaymentId;
  label: string;
  subtitle: string;
  icon: CheckoutPaymentIcon;
}

export interface CheckoutAddress {
  label: string;
  address: string;
}
