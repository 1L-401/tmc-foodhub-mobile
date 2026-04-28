import { apiClient } from '@/src/api/apiClient';

export const inventoryQueryKeys = {
  categories: ['inventory', 'categories'] as const,
  items: ['inventory', 'items'] as const,
};

export type InventoryCategory = {
  id: number;
  name: string;
  display_order?: number;
  restaurant_owner_id?: number;
};

export type InventoryMenuItem = {
  id: number;
  category_id: number | null;
  title: string;
  description?: string | null;
  price: number;
  image?: string | null;
  available: boolean;
  stock_level: number;
  min_threshold?: number | null;
  unit?: string | null;
  auto_toggle?: boolean | null;
  category?: InventoryCategory | null;
};

export type InventoryMenuItemInput = {
  category_id?: number | null;
  title: string;
  description?: string | null;
  price: number;
  image?: string | null;
  available?: boolean;
  stock_level?: number;
  min_threshold?: number | null;
  unit?: string | null;
  auto_toggle?: boolean | null;
};

const CATEGORY_ENDPOINT = '/owner/inventory/categories';
const ITEMS_ENDPOINT = '/owner/inventory/items';

export const fetchInventoryCategories = async () =>
  apiClient<InventoryCategory[]>(CATEGORY_ENDPOINT);

export const createInventoryCategory = async (payload: { name: string }) =>
  apiClient<InventoryCategory>(CATEGORY_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateInventoryCategory = async (id: number, payload: { name: string }) =>
  apiClient<InventoryCategory>(`${CATEGORY_ENDPOINT}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const reorderInventoryCategories = async (categoryIds: number[]) =>
  apiClient<{ message: string }>(`${CATEGORY_ENDPOINT}/reorder`, {
    method: 'PATCH',
    body: JSON.stringify({ category_ids: categoryIds }),
  });

export const deleteInventoryCategory = async (id: number) =>
  apiClient<{ message: string }>(`${CATEGORY_ENDPOINT}/${id}`, {
    method: 'DELETE',
  });

export const fetchInventoryItems = async () =>
  apiClient<InventoryMenuItem[]>(ITEMS_ENDPOINT);

export const createInventoryItem = async (payload: InventoryMenuItemInput) =>
  apiClient<InventoryMenuItem>(ITEMS_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateInventoryItem = async (id: number, payload: InventoryMenuItemInput) =>
  apiClient<InventoryMenuItem>(`${ITEMS_ENDPOINT}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const updateInventoryItemStock = async (id: number, stockLevel: number) =>
  apiClient<InventoryMenuItem>(`${ITEMS_ENDPOINT}/${id}/stock`, {
    method: 'PATCH',
    body: JSON.stringify({ stock_level: stockLevel }),
  });

export const updateInventoryItemAvailability = async (id: number, available: boolean) =>
  apiClient<InventoryMenuItem>(`${ITEMS_ENDPOINT}/${id}/availability`, {
    method: 'PATCH',
    body: JSON.stringify({ available }),
  });

export const deleteInventoryItem = async (id: number) =>
  apiClient<{ message: string }>(`${ITEMS_ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
