import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useSegments } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCart } from '@/components/cart';
import { apiClient } from '@/src/api/apiClient';
import { applyLocalOrderStatuses } from '@/src/features/orders/local-order-status';
import { isOngoingStatus, normalizeOrderStatus } from '@/src/features/orders/order-status';

interface OrderItem {
  item_name?: string;
}

interface OngoingOrder {
  id: number | string;
  status: string;
  store_name?: string;
  items?: OrderItem[];
}

function buildTrackerCopy(order: OngoingOrder) {
  const normalizedStatus = normalizeOrderStatus(order.status);

  if (normalizedStatus === 'pending') {
    return 'Waiting for restaurant confirmation';
  }

  if (normalizedStatus === 'order confirmed') {
    return 'Restaurant confirmed your order';
  }

  if (normalizedStatus === 'preparing') {
    return 'Your food is being prepared';
  }

  if (normalizedStatus === 'out for delivery') {
    return 'Your rider is on the way';
  }

  return order.status;
}

const TAB_BAR_HEIGHT = 84;
const CART_SHEET_HEIGHT = 224;

export function OngoingOrderBar() {
  const [ongoingOrder, setOngoingOrder] = useState<OngoingOrder | null>(null);
  const [animation] = useState(() => new Animated.Value(0));
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const { cartItems } = useCart();

  const fetchOngoingOrder = useCallback(async () => {
    try {
      const response = await apiClient<OngoingOrder[]>('/orders');
      const mergedOrders = applyLocalOrderStatuses(response || []);
      const nextOngoingOrder = mergedOrders.find((order) => isOngoingStatus(order.status)) ?? null;
      setOngoingOrder(nextOngoingOrder);
    } catch (error) {
      console.error('Failed to load ongoing order bar:', error);
    }
  }, []);

  useEffect(() => {
    fetchOngoingOrder();
    const interval = setInterval(fetchOngoingOrder, 10000);
    return () => clearInterval(interval);
  }, [fetchOngoingOrder]);

  const currentPath = segments.join('/');
  const isTabsRoute = segments[0] === '(tabs)';
  const isCartRoute = currentPath === '(tabs)/cart';
  const shouldHideBar =
    currentPath.startsWith('(auth)') ||
    currentPath === 'get-started' ||
    currentPath === 'index' ||
    currentPath === 'settings' ||
    currentPath === 'account-settings' ||
    currentPath === 'notification-settings' ||
    currentPath === 'notifications' ||
    currentPath === 'privacy-security' ||
    currentPath === 'terms-policies' ||
    currentPath === 'help-support' ||
    currentPath === 'verify-email' ||
    currentPath === 'change-password' ||
    currentPath === 'order-tracking/[id]';

  const bottomOffset = isCartRoute
    ? cartItems.length > 0
      ? CART_SHEET_HEIGHT + TAB_BAR_HEIGHT + insets.bottom
      : TAB_BAR_HEIGHT + 12 + insets.bottom
    : isTabsRoute
      ? TAB_BAR_HEIGHT + 12 + insets.bottom
      : 16 + insets.bottom;

  useEffect(() => {
    Animated.spring(animation, {
      toValue: ongoingOrder && !shouldHideBar ? 1 : 0,
      useNativeDriver: true,
      damping: 18,
      stiffness: 180,
      mass: 0.9,
    }).start();
  }, [animation, ongoingOrder, shouldHideBar]);

  if (!ongoingOrder || shouldHideBar) {
    return null;
  }

  const firstItemName = ongoingOrder.items?.[0]?.item_name;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          bottom: bottomOffset,
          opacity: animation,
          transform: [
            {
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [18, 0],
              }),
            },
            {
              scale: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.98, 1],
              }),
            },
          ],
        },
      ]}>
      <Pressable
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
        onPress={() =>
          router.push({
            pathname: '/order-tracking/[id]',
            params: { id: ongoingOrder.id },
          })
        }>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name="motorbike" size={18} color="#FFFFFF" />
        </View>

        <View style={styles.copyWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {ongoingOrder.store_name || firstItemName || `Order #${ongoingOrder.id}`}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {buildTrackerCopy(ongoingOrder)}
          </Text>
        </View>

        <View style={styles.trackPill}>
          <Text style={styles.trackText}>Track</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 20,
  },
  pressable: {
    height: 64,
    borderRadius: 18,
    backgroundColor: '#AC1D10',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyWrap: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.82)',
  },
  trackPill: {
    height: 34,
    borderRadius: 17,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#AC1D10',
  },
  pressed: {
    opacity: 0.9,
  },
});
