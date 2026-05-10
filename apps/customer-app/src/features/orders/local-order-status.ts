import { Platform } from 'react-native';
import { MMKV } from 'react-native-mmkv';

// @ts-ignore
const storage = Platform.OS !== 'web' ? new MMKV() : null;
const STORAGE_KEY = 'customer_local_order_status_overrides';

type OrderStatusOverrides = Record<string, string>;

function getStorageString(key: string): string | null {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }

  return storage?.getString(key) ?? null;
}

function setStorageString(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }

  storage?.set(key, value);
}

function readOverrides(): OrderStatusOverrides {
  const rawValue = getStorageString(STORAGE_KEY);

  if (!rawValue) {
    return {};
  }

  try {
    return JSON.parse(rawValue) as OrderStatusOverrides;
  } catch {
    return {};
  }
}

function writeOverrides(overrides: OrderStatusOverrides) {
  setStorageString(STORAGE_KEY, JSON.stringify(overrides));
}

export function getLocalOrderStatus(orderId: string | number) {
  const overrides = readOverrides();
  return overrides[String(orderId)] ?? null;
}

export function setLocalOrderStatus(orderId: string | number, status: string) {
  const overrides = readOverrides();
  overrides[String(orderId)] = status;
  writeOverrides(overrides);
}

export function applyLocalOrderStatus<T extends { id: string | number; status: string }>(order: T): T {
  const overriddenStatus = getLocalOrderStatus(order.id);

  if (!overriddenStatus) {
    return order;
  }

  return {
    ...order,
    status: overriddenStatus,
  };
}

export function applyLocalOrderStatuses<T extends { id: string | number; status: string }>(orders: T[]): T[] {
  return orders.map(applyLocalOrderStatus);
}
