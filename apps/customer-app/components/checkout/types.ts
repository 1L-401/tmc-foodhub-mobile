export type CheckoutPaymentIcon = 'gcash' | 'cod';

export interface CheckoutPaymentOption {
  id: string;
  label: string;
  subtitle: string;
  icon: CheckoutPaymentIcon;
}

export interface CheckoutAddress {
  label: string;
  address: string;
}
