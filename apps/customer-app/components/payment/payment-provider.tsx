import React, { createContext, useContext, useMemo, useState } from 'react';

import type {
  CheckoutPaymentId,
  CheckoutPaymentOption,
} from '@/components/checkout/types';
import { CHECKOUT_PAYMENT_OPTIONS } from '@/constants/mock-checkout-data';

type WalletPaymentId = Extract<CheckoutPaymentId, 'gcash' | 'maya'>;
type CartPaymentId = Exclude<CheckoutPaymentId, 'cod'>;

export interface SavedCardData {
  cardNumber: string;
  expiryDate: string;
  cardholderName: string;
}

interface SaveCardPayload {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

interface PaymentContextValue {
  paymentOptions: CheckoutPaymentOption[];
  checkoutPaymentOptions: CheckoutPaymentOption[];
  selectedPaymentId: CheckoutPaymentId;
  selectedPayment: CheckoutPaymentOption;
  preferredPaymentId: CartPaymentId;
  preferredPayment: CheckoutPaymentOption;
  savedCard: SavedCardData | null;
  selectPaymentForOrder: (methodId: CheckoutPaymentId) => void;
  saveWalletMethod: (methodId: WalletPaymentId) => void;
  saveCardMethod: (payload: SaveCardPayload) => void;
}

const PaymentContext = createContext<PaymentContextValue | null>(null);

const FALLBACK_PAYMENT_OPTION: CheckoutPaymentOption = {
  id: 'gcash',
  label: 'GCash',
  subtitle: '•••• 9876',
  icon: 'gcash',
};

const FALLBACK_COD_OPTION: CheckoutPaymentOption = {
  id: 'cod',
  label: 'Cash on Delivery',
  subtitle: 'Pay when food arrives',
  icon: 'cod',
};

export function PaymentProvider({ children }: React.PropsWithChildren) {
  const [preferredPaymentId, setPreferredPaymentId] = useState<CartPaymentId>('gcash');
  const [selectedPaymentId, setSelectedPaymentId] = useState<CheckoutPaymentId>('gcash');
  const [savedCard, setSavedCard] = useState<SavedCardData | null>(null);

  const paymentOptions = useMemo<CheckoutPaymentOption[]>(() => {
    return CHECKOUT_PAYMENT_OPTIONS.map((option) => {
      if (option.id !== 'card') {
        return option;
      }

      if (!savedCard) {
        return option;
      }

      return {
        ...option,
        subtitle: `•••• ${savedCard.cardNumber.slice(-4)}`,
      };
    });
  }, [savedCard]);

  const preferredPayment =
    paymentOptions.find((option) => option.id === preferredPaymentId) ??
    FALLBACK_PAYMENT_OPTION;

  const codPayment =
    paymentOptions.find((option) => option.id === 'cod') ??
    FALLBACK_COD_OPTION;

  const checkoutPaymentOptions = useMemo(
    () =>
      preferredPayment.id === codPayment.id
        ? [codPayment]
        : [preferredPayment, codPayment],
    [codPayment, preferredPayment]
  );

  const checkoutSelectedPaymentId: CheckoutPaymentId = useMemo(
    () =>
      selectedPaymentId === 'cod' || selectedPaymentId === preferredPaymentId
        ? selectedPaymentId
        : preferredPaymentId,
    [preferredPaymentId, selectedPaymentId]
  );

  const checkoutSelectedPayment = useMemo(
    () =>
      paymentOptions.find((option) => option.id === checkoutSelectedPaymentId) ??
      preferredPayment,
    [checkoutSelectedPaymentId, paymentOptions, preferredPayment]
  );

  const value = useMemo<PaymentContextValue>(
    () => ({
      paymentOptions,
      checkoutPaymentOptions,
      selectedPaymentId: checkoutSelectedPaymentId,
      selectedPayment: checkoutSelectedPayment,
      preferredPaymentId,
      preferredPayment,
      savedCard,
      selectPaymentForOrder: (methodId) => {
        if (methodId !== 'cod' && methodId !== preferredPaymentId) {
          return;
        }

        setSelectedPaymentId(methodId);
      },
      saveWalletMethod: (methodId) => {
        setPreferredPaymentId(methodId);
        setSelectedPaymentId(methodId);
      },
      saveCardMethod: (payload) => {
        const normalizedCardNumber = payload.cardNumber.replace(/\D/g, '');
        const normalizedExpiryDate = payload.expiryDate.trim();
        const normalizedCardholderName = payload.cardholderName.trim();

        setSavedCard({
          cardNumber: normalizedCardNumber,
          expiryDate: normalizedExpiryDate,
          cardholderName: normalizedCardholderName,
        });
        setPreferredPaymentId('card');
        setSelectedPaymentId('card');
      },
    }),
    [
      checkoutPaymentOptions,
      checkoutSelectedPayment,
      checkoutSelectedPaymentId,
      paymentOptions,
      preferredPayment,
      preferredPaymentId,
      savedCard,
    ]
  );

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);

  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }

  return context;
}
