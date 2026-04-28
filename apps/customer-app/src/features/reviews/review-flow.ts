import { Platform } from 'react-native';
import { MMKV } from 'react-native-mmkv';

import { apiClient } from '@/src/api/apiClient';
import { fetchRestaurants } from '@/src/features/browse/api/useRestaurants';

const storage = Platform.OS !== 'web' ? new MMKV() : null;
const REVIEWED_ORDERS_KEY = 'customer_reviewed_orders';

export interface ReviewedOrderRecord {
  orderId: string;
  restaurantId: string;
  storeName: string;
  rating: number;
  review: string;
  reviewedAt: string;
}

type ReviewedOrdersMap = Record<string, ReviewedOrderRecord>;

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

function readReviewedOrders(): ReviewedOrdersMap {
  const rawValue = getStorageString(REVIEWED_ORDERS_KEY);

  if (!rawValue) {
    return {};
  }

  try {
    return JSON.parse(rawValue) as ReviewedOrdersMap;
  } catch {
    return {};
  }
}

export function getReviewedOrder(orderId: string | number | undefined | null) {
  if (!orderId) {
    return null;
  }

  const reviewedOrders = readReviewedOrders();
  return reviewedOrders[String(orderId)] ?? null;
}

export function saveReviewedOrder(record: ReviewedOrderRecord) {
  const reviewedOrders = readReviewedOrders();
  reviewedOrders[record.orderId] = record;
  setStorageString(REVIEWED_ORDERS_KEY, JSON.stringify(reviewedOrders));
}

function normalizeText(value: string | null | undefined) {
  return (value ?? '').trim().toLowerCase();
}

export function getRestaurantIdFromSource(source: Record<string, unknown> | null | undefined) {
  if (!source) {
    return null;
  }

  const candidates = [
    source.restaurant_id,
    source.restaurantId,
    source.store_id,
    source.storeId,
    (source.restaurant as { id?: string | number } | undefined)?.id,
  ];

  const match = candidates.find((candidate) => candidate !== undefined && candidate !== null && candidate !== '');
  return match ? String(match) : null;
}

export async function resolveRestaurantIdForOrder(source: Record<string, unknown> | null | undefined) {
  const directRestaurantId = getRestaurantIdFromSource(source);
  if (directRestaurantId) {
    return directRestaurantId;
  }

  const storeName = normalizeText(String(source?.store_name ?? source?.restaurant_name ?? source?.name ?? ''));
  if (!storeName) {
    return null;
  }

  const restaurants = await fetchRestaurants();
  const exactMatch = restaurants.find((restaurant) => normalizeText(restaurant.name) === storeName);
  if (exactMatch) {
    return String(exactMatch.id);
  }

  const partialMatch = restaurants.find((restaurant) => {
    const normalizedRestaurantName = normalizeText(restaurant.name);
    return normalizedRestaurantName.includes(storeName) || storeName.includes(normalizedRestaurantName);
  });

  return partialMatch ? String(partialMatch.id) : null;
}

export async function submitReviewForOrder({
  orderId,
  restaurantId,
  rating,
  review,
}: {
  orderId: string;
  restaurantId: string;
  rating: number;
  review: string;
}) {
  await apiClient(`/restaurants/${restaurantId}/reviews`, {
    method: 'POST',
    body: JSON.stringify({
      rating,
      review,
      order_id: orderId,
    }),
  });
}
