import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { CheckoutPaymentOption } from '@/components/checkout/types';
import { useAuth } from '@/contexts/auth-context';
import { geocodeAddress } from '@/src/api/geocode';

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
  addressCoords: { latitude: number; longitude: number } | null;
  setPromoCode: (value: string) => void;
  applyPromoCode: () => void;
  setSpecialInstructions: (value: string) => void;
  addItem: (item: CartItemModel) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  removeItem: (id: string) => void;
  selectAddressById: (id: string) => void;
  placeOrderFromCart: (paymentMethod: CheckoutPaymentOption) => ActiveOrder;
  clearActiveOrder: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const DEFAULT_DELIVERY_FEE = 3;

function buildOrderShortId(timestamp: number) {
  return `#${String(timestamp).slice(-4)}`;
}

/**
 * Build a SavedAddress object from the user's profile address string.
 */
function buildAddressFromProfile(address: string | undefined): SavedAddress {
  if (!address || !address.trim()) {
    return {
      id: 'addr-profile',
      label: 'Home',
      street: 'No address set',
      fullAddress: 'Please add a delivery address',
      isDefault: true,
    };
  }

  return {
    id: 'addr-profile',
    label: 'Home',
    street: address.length > 50 ? `${address.slice(0, 50)}...` : address,
    fullAddress: address,
    isDefault: true,
  };
}

export function CartProvider({ children }: React.PropsWithChildren) {
  const { user } = useAuth();

  // ── Live cart starts empty ──
  const [cartItems, setCartItems] = useState<CartItemModel[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);
  const [addressCoords, setAddressCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  // ── Build delivery address from user profile ──
  const profileAddress = useMemo(
    () => buildAddressFromProfile(user?.address),
    [user?.address]
  );

  const [selectedAddressId, setSelectedAddressId] = useState(profileAddress.id);

  const savedAddresses = useMemo(() => [profileAddress], [profileAddress]);
  const deliveryFee = DEFAULT_DELIVERY_FEE;

  const selectedAddress = useMemo(
    () =>
      savedAddresses.find((address) => address.id === selectedAddressId) ??
      profileAddress,
    [savedAddresses, selectedAddressId, profileAddress]
  );

  // ── Geocode user address for the map ──
  useEffect(() => {
    if (!user?.address) {
      setAddressCoords(null);
      return;
    }

    let cancelled = false;

    geocodeAddress(user.address).then((coords) => {
      if (!cancelled) {
        setAddressCoords(coords);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user?.address]);

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

  // ── Add a new item to cart (or increase qty if already present) ──
  const addItem = useCallback((newItem: CartItemModel) => {
    setCartItems((previousItems) => {
      const existingIndex = previousItems.findIndex((item) => item.id === newItem.id);

      if (existingIndex >= 0) {
        // Item already in cart — increase quantity
        return previousItems.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // New item — add with quantity 1
      return [...previousItems, { ...newItem, quantity: 1 }];
    });
  }, []);

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
      setAppliedDiscount(5);
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
      addressCoords,
      setPromoCode,
      applyPromoCode,
      setSpecialInstructions,
      addItem,
      increaseQuantity,
      decreaseQuantity,
      removeItem,
      selectAddressById,
      placeOrderFromCart,
      clearActiveOrder,
    }),
    [
      activeOrder,
      addressCoords,
      addItem,
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
