import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { CheckoutPaymentOption } from '@/components/checkout/types';
import {
  DEFAULT_DELIVERY_ADDRESS,
  DEFAULT_DELIVERY_FEE,
  DEFAULT_DISCOUNT,
  MOCK_CART_ITEMS,
  SAVED_ADDRESSES,
} from '@/constants/mock-cart-data';

import type { CartItemModel, SavedAddress } from './types';

export interface ActiveOrder {
  id: string;
  shortId: string;
  items: CartItemModel[];
  address: SavedAddress;
  paymentMethod: CheckoutPaymentOption;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  promoCode: string;
  specialInstructions: string;
  placedAt: string;
}

interface CartContextValue {
  cartItems: CartItemModel[];
  itemCount: number;
  promoCode: string;
  appliedDiscount: number;
  deliveryFee: number;
  subtotal: number;
  total: number;
  specialInstructions: string;
  selectedAddress: SavedAddress;
  savedAddresses: SavedAddress[];
  activeOrder: ActiveOrder | null;
  setPromoCode: (value: string) => void;
  applyPromoCode: () => void;
  setSpecialInstructions: (value: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  removeItem: (id: string) => void;
  selectAddressById: (id: string) => void;
  placeOrderFromCart: (paymentMethod: CheckoutPaymentOption) => ActiveOrder;
  clearActiveOrder: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function buildOrderShortId(timestamp: number) {
  return `#${String(timestamp).slice(-4)}`;
}

export function CartProvider({ children }: React.PropsWithChildren) {
  const [cartItems, setCartItems] = useState<CartItemModel[]>(MOCK_CART_ITEMS);
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(DEFAULT_DISCOUNT);
  const [selectedAddressId, setSelectedAddressId] = useState(DEFAULT_DELIVERY_ADDRESS.id);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);

  const deliveryFee = DEFAULT_DELIVERY_FEE;
  const savedAddresses = SAVED_ADDRESSES;

  const selectedAddress = useMemo(
    () =>
      savedAddresses.find((address) => address.id === selectedAddressId) ??
      DEFAULT_DELIVERY_ADDRESS,
    [savedAddresses, selectedAddressId]
  );

  const itemCount = useMemo(
    () => cartItems.reduce((totalItems, item) => totalItems + item.quantity, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (subtotalValue, item) => subtotalValue + item.price * item.quantity,
        0
      ),
    [cartItems]
  );

  const total = useMemo(
    () => Math.max(0, subtotal + deliveryFee - appliedDiscount),
    [appliedDiscount, deliveryFee, subtotal]
  );

  const increaseQuantity = useCallback((id: string) => {
    setCartItems((previousItems) =>
      previousItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }, []);

  const decreaseQuantity = useCallback((id: string) => {
    setCartItems((previousItems) =>
      previousItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setCartItems((previousItems) =>
      previousItems.filter((item) => item.id !== id)
    );
  }, []);

  const selectAddressById = useCallback((id: string) => {
    if (!savedAddresses.some((address) => address.id === id)) {
      return;
    }

    setSelectedAddressId(id);
  }, [savedAddresses]);

  const applyPromoCode = useCallback(() => {
    const normalizedCode = promoCode.trim().toUpperCase();

    if (!normalizedCode || normalizedCode === 'PROMO5') {
      setAppliedDiscount(DEFAULT_DISCOUNT);
      return;
    }

    setAppliedDiscount(0);
  }, [promoCode]);

  const placeOrderFromCart = useCallback((paymentMethod: CheckoutPaymentOption) => {
    const timestamp = Date.now();
    const nextOrder: ActiveOrder = {
      id: `ord-${timestamp}`,
      shortId: buildOrderShortId(timestamp),
      items: cartItems.map((item) => ({ ...item })),
      address: { ...selectedAddress },
      paymentMethod: { ...paymentMethod },
      subtotal,
      deliveryFee,
      discount: appliedDiscount,
      total,
      promoCode,
      specialInstructions: specialInstructions.trim(),
      placedAt: new Date(timestamp).toISOString(),
    };

    setActiveOrder(nextOrder);
    return nextOrder;
  }, [
    appliedDiscount,
    cartItems,
    deliveryFee,
    promoCode,
    selectedAddress,
    specialInstructions,
    subtotal,
    total,
  ]);

  const clearActiveOrder = useCallback(() => {
    setActiveOrder(null);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      cartItems,
      itemCount,
      promoCode,
      appliedDiscount,
      deliveryFee,
      subtotal,
      total,
      specialInstructions,
      selectedAddress,
      savedAddresses,
      activeOrder,
      setPromoCode,
      applyPromoCode,
      setSpecialInstructions,
      increaseQuantity,
      decreaseQuantity,
      removeItem,
      selectAddressById,
      placeOrderFromCart,
      clearActiveOrder,
    }),
    [
      activeOrder,
      appliedDiscount,
      applyPromoCode,
      cartItems,
      clearActiveOrder,
      decreaseQuantity,
      deliveryFee,
      increaseQuantity,
      itemCount,
      placeOrderFromCart,
      promoCode,
      removeItem,
      savedAddresses,
      selectAddressById,
      selectedAddress,
      specialInstructions,
      subtotal,
      total,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
