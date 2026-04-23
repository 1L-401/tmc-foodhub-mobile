import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { MMKV } from 'react-native-mmkv';

import type { CheckoutPaymentOption } from '@/components/checkout/types';
import { useAuth } from '@/contexts/auth-context';
import { geocodeAddress } from '@/src/api/geocode';

import type { CartItemModel, SavedAddress } from './types';

// ── Persistent Local Storage ──
const storage = Platform.OS !== 'web' ? new MMKV() : null;

function getStorageString(key: string): string | null {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return storage?.getString(key) ?? null;
}

function setStorageString(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    storage?.set(key, value);
  }
}

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
  fetchCart: () => Promise<void>;
  isCartLoading: boolean;
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
  const [isCartLoading, setIsCartLoading] = useState(false);
  const loadedUserIdRef = React.useRef<number | string | null | undefined>(undefined);
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);
  const [addressCoords, setAddressCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  // ── Fetch Cart (Manual Refresh) ──
  const fetchCart = useCallback(async () => {
    if (!user?.id) return;
    setIsCartLoading(true);
    // Simulate a brief network delay since we are pulling from local storage
    // but the user requested a pull-to-refresh interaction
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const key = `cart_${user.id}`;
    const stored = getStorageString(key);
    if (stored) {
      try {
        setCartItems(JSON.parse(stored));
      } catch (e) {
        setCartItems([]);
      }
    }
    setIsCartLoading(false);
  }, [user?.id]);

  // ── Load cart from local storage when user changes ──
  useEffect(() => {
    setIsCartLoading(true);
    if (user?.id) {
      const key = `cart_${user.id}`;
      const stored = getStorageString(key);
      if (stored) {
        try {
          setCartItems(JSON.parse(stored));
        } catch (e) {
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
    loadedUserIdRef.current = user?.id;
    setIsCartLoading(false);
  }, [user?.id]);

  // ── Save cart to local storage whenever it changes ──
  useEffect(() => {
    // Only save if we have finished loading the cart for the current user
    if (user?.id && loadedUserIdRef.current === user.id) {
      const key = `cart_${user.id}`;
      setStorageString(key, JSON.stringify(cartItems));
    }
  }, [cartItems, user?.id]);

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
        (subtotalValue, item) => {
          const addonTotal = (item.selectedAddons || []).reduce((s, a) => s + a.price, 0);
          return subtotalValue + (item.price + addonTotal) * item.quantity;
        },
        0
      ),
    [cartItems]
  );

  const total = useMemo(
    () => Math.max(0, subtotal + deliveryFee - appliedDiscount),
    [appliedDiscount, deliveryFee, subtotal]
  );

  // ── Build a unique cart key from item id + variation + addons ──
  const buildCartKey = useCallback((item: CartItemModel) => {
    let key = String(item.id);
    if (item.selectedVariation) key += `__v:${item.selectedVariation.name}`;
    if (item.selectedAddons?.length) {
      key += `__a:${item.selectedAddons.map(a => a.name).sort().join(',')}`;
    }
    return key;
  }, []);

  // ── Add a new item to cart (or increase qty if already present) ──
  const addItem = useCallback((newItem: CartItemModel) => {
    setCartItems((previousItems) => {
      const cartKey = buildCartKey(newItem);
      const existingIndex = previousItems.findIndex((item) => buildCartKey(item) === cartKey);

      if (existingIndex >= 0) {
        // Same item + same variation + same addons — increase quantity
        return previousItems.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
            : item
        );
      }

      // New combination — add to cart
      return [...previousItems, { ...newItem, quantity: newItem.quantity || 1 }];
    });
  }, [buildCartKey]);

  const increaseQuantity = useCallback((id: string) => {
    setCartItems((previousItems) => {
      // Find the item to check its variation+addon unique key
      const targetItem = previousItems.find((item) => item.id === id || buildCartKey(item) === id);
      const keyToMatch = targetItem ? buildCartKey(targetItem) : id;

      return previousItems.map((item) =>
        buildCartKey(item) === keyToMatch || item.id === id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      );
    });
  }, [buildCartKey]);

  const decreaseQuantity = useCallback((id: string) => {
    setCartItems((previousItems) => {
      // Find the item to check its variation+addon unique key
      const targetItem = previousItems.find((item) => item.id === id || buildCartKey(item) === id);
      const keyToMatch = targetItem ? buildCartKey(targetItem) : id;
      
      return previousItems.map((item) =>
        buildCartKey(item) === keyToMatch || item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      );
    });
  }, [buildCartKey]);

  const removeItem = useCallback((id: string) => {
    setCartItems((previousItems) => {
      const targetItem = previousItems.find((item) => item.id === id || buildCartKey(item) === id);
      const keyToMatch = targetItem ? buildCartKey(targetItem) : id;
      
      return previousItems.filter((item) => buildCartKey(item) !== keyToMatch && item.id !== id);
    });
  }, [buildCartKey]);

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
      fetchCart,
      isCartLoading,
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
