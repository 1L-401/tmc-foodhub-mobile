import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/src/api/apiClient';

export interface MenuItem {
  id: string | number;
  title: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  isBestSeller: boolean;
  category: string;
  image: string;
}

export interface RestaurantMenuResponse {
  restaurant: {
    id: string | number;
    name: string;
    categories: string[];
    rating: number;
    reviews: number;
    isOpen: boolean;
    distance: string;
    deliveryTime: string;
    logo: string;
  };
  menuCategories: string[];
  items: MenuItem[];
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
