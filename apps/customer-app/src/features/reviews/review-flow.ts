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
  deliveryRating?: number;
  review: string;
  highlights?: string[];
  photoUris?: string[];
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
    (source.store as { id?: string | number } | undefined)?.id,
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
  foodRating,
  deliveryRating,
  review,
  highlights,
  photoAssets,
}: {
  orderId: string;
  restaurantId: string;
  foodRating: number;
  deliveryRating?: number;
  review: string;
  highlights?: string[];
  photoAssets?: {
    uri: string;
    fileName?: string | null;
    mimeType?: string | null;
  }[];
}) {
  const formData = new FormData();

  formData.append('rating', String(foodRating));
  formData.append('food_rating', String(foodRating));
  formData.append('review', review);
  formData.append('order_id', orderId);

  if (deliveryRating) {
    formData.append('delivery_rating', String(deliveryRating));
  }

  highlights?.forEach((highlight, index) => {
    formData.append(`highlights[${index}]`, highlight);
  });

  photoAssets?.forEach((asset, index) => {
    formData.append(`photos[${index}]`, {
      uri: asset.uri,
      name: asset.fileName || `review-photo-${index + 1}.jpg`,
      type: asset.mimeType || 'image/jpeg',
    } as unknown as Blob);
  });

  await apiClient(`/restaurants/${restaurantId}/reviews`, {
    method: 'POST',
    body: formData,
  });
}
