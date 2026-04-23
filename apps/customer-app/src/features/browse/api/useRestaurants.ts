import { useQuery } from '@tanstack/react-query';
import { BASE_URL } from '@/src/api/apiClient';

interface ApiRestaurant {
  id: number;
  name: string;
  restaurant_name?: string;
  owner_name?: string;
  business_address?: string;
  business_contact_number?: string;
  available_items_count?: number;
  logo?: string | null;
  cover_image?: string | null;
  cuisine_type?: string[];
  price_range?: string | null;
  rating?: number;
  reviews_count?: number;
  operating_status?: string;
}

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
  logo?: string | null;
  cover_image?: string | null;
  owner_name?: string;
  business_address?: string;
  business_contact_number?: string;
  price_range?: string | null;
  available_items_count?: number;
  operating_status?: string;
}

const mapRestaurant = (restaurant: ApiRestaurant): Restaurant => {
  const cuisineLabel =
    restaurant.cuisine_type && restaurant.cuisine_type.length > 0
      ? restaurant.cuisine_type.join(', ')
      : 'Restaurant';

  return {
    id: restaurant.id,
    name: restaurant.restaurant_name || restaurant.name,
    category: cuisineLabel,
    rating: restaurant.rating ?? 0,
    reviews: restaurant.reviews_count ?? 0,
    // API does not currently provide delivery fee or ETA
    price: 50,
    time: '30-45 min',
    color: '#F9F9F9',
    accent: '#AC1D10',
    logo: restaurant.logo ?? null,
    cover_image: restaurant.cover_image ?? null,
    owner_name: restaurant.owner_name,
    business_address: restaurant.business_address,
    business_contact_number: restaurant.business_contact_number,
    price_range: restaurant.price_range ?? null,
    available_items_count: restaurant.available_items_count,
    operating_status: restaurant.operating_status,
  };
};

export const fetchRestaurants = async (): Promise<Restaurant[]> => {
  const response = await fetch(`${BASE_URL}/restaurants`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch restaurants (${response.status})`);
  }

  const data: ApiRestaurant[] = await response.json();
  return data.map(mapRestaurant);
};

export const useRestaurants = () => {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: fetchRestaurants,
  });
};
