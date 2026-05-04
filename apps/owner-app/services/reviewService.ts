import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/src/api/apiClient';

export interface ReviewItem {
  id: number;
  rating: number;
  review: string;
  photos: string[];
  helpful_count: number;
  is_verified: boolean;
  customer_name: string;
  customer_initials: string;
  created_at: string;
  created_at_human: string;
  created_at_label: string;
  owner_reply: string | null;
  owner_replied_at: string | null;
  owner_replied_at_human: string | null;
  order_number: string;
  order_items: { name: string; image: string }[];
}

export interface ReviewDistribution {
  rating: number;
  count: number;
  percentage: number;
}

export interface ReviewSummary {
  average_rating: number;
  total_reviews: number;
  five_star_reviews: number;
  distribution: ReviewDistribution[];
}

export interface RestaurantReviewsResponse {
  summary: ReviewSummary;
  reviews: ReviewItem[];
}

export const fetchOwnerReviews = (restaurantId: string | number): Promise<RestaurantReviewsResponse> => {
  return apiClient(`/restaurants/${restaurantId}/reviews`);
};

export const useOwnerReviews = (restaurantId?: string | number) => {
  return useQuery({
    queryKey: ['owner', 'reviews', restaurantId],
    queryFn: () => fetchOwnerReviews(restaurantId!),
    enabled: !!restaurantId,
  });
};
