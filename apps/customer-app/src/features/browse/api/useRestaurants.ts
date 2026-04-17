import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/src/api/apiClient';

export interface Restaurant {
  id: string | number;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  price: number;
  time: string;
  color: string;
  accent: string;
  logo?: string;
}

export const fetchRestaurants = (): Promise<Restaurant[]> => {
  return apiClient('/restaurants');
};

export const useRestaurants = () => {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: fetchRestaurants,
  });
};
