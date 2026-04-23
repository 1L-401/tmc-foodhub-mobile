import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/src/api/apiClient';

export interface MenuItemVariation {
  id: number;
  name: string;
  price: string | number;
}

export interface MenuItemAddon {
  id: number;
  name: string;
  price: string | number;
}

export interface MenuItem {
  id: string | number;
  title: string;
  description: string;
  price: string | number;
  rating?: number;
  reviews_count?: number;
  reviews?: number;
  isBestSeller?: boolean;
  category?: string;
  image: string;
  variations?: MenuItemVariation[];
  add_ons?: MenuItemAddon[];
}

export interface MenuCategoryPayload {
  id: number;
  name: string;
}

export interface RestaurantMenuResponse {
  restaurant: any;
  categories: MenuCategoryPayload[];
  menu: Record<string, MenuItem[]>;
}

export const fetchRestaurantMenu = (id: string | number): Promise<RestaurantMenuResponse> => {
  return apiClient(`/restaurants/${id}/menu`);
};

export const useRestaurantMenu = (id: string | number) => {
  return useQuery({
    queryKey: ['restaurant-menu', id],
    queryFn: () => fetchRestaurantMenu(id),
    enabled: !!id,
  });
};
