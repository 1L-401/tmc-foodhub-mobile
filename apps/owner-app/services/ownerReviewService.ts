import { resolveApiMediaUrl } from '@/src/api/apiConfig';
import { apiClient } from '@/src/api/apiClient';

export type OwnerReviewSummary = {
  averageRating: number;
  totalReviews: number;
  fiveStarReviews: number;
  awaitingReply: number;
};

export type OwnerReview = {
  id: string;
  customerName: string;
  customerInitials: string;
  rating: number;
  review: string;
  createdAtLabel: string;
  orderNumber: string;
  orderItems: string[];
  avatar: string | null;
  helpfulCount: number;
  ownerReply: string;
};

type RawOwnerReview = {
  id?: unknown;
  customer_name?: unknown;
  customer_initials?: unknown;
  rating?: unknown;
  review?: unknown;
  created_at_label?: unknown;
  created_at_human?: unknown;
  created_at?: unknown;
  order_number?: unknown;
  order_items?: unknown;
  avatar?: unknown;
  customer_avatar?: unknown;
  helpful_count?: unknown;
  owner_reply?: unknown;
};

type RawOwnerReviewSummary = {
  average_rating?: unknown;
  total_reviews?: unknown;
  five_star_reviews?: unknown;
  awaiting_reply?: unknown;
};

type RawOwnerReviewsResponse =
  | RawOwnerReview[]
  | {
      summary?: RawOwnerReviewSummary;
      reviews?: RawOwnerReview[];
    };

export const ownerReviewQueryKeys = {
  all: ['owner', 'reviews'] as const,
};

const toStringValue = (value: unknown, fallback = '') => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return fallback;
};

const toNumber = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
  return initials || name.slice(0, 2).toUpperCase() || 'CU';
};

const normalizeOrderItems = (items: unknown) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      if (typeof item === 'string') {
        return item;
      }

      if (typeof item === 'object' && item !== null) {
        return toStringValue((item as Record<string, unknown>).name);
      }

      return '';
    })
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeReview = (review: RawOwnerReview): OwnerReview => {
  const customerName = toStringValue(review.customer_name, 'Customer').trim() || 'Customer';
  const customerInitials =
    toStringValue(review.customer_initials).trim() || buildInitials(customerName);
  const avatar = resolveApiMediaUrl(
    toStringValue(review.customer_avatar) || toStringValue(review.avatar),
  );

  return {
    id: toStringValue(review.id, customerName),
    customerName,
    customerInitials,
    rating: toNumber(review.rating),
    review: toStringValue(review.review),
    createdAtLabel:
      toStringValue(review.created_at_label) ||
      toStringValue(review.created_at_human) ||
      toStringValue(review.created_at),
    orderNumber: toStringValue(review.order_number),
    orderItems: normalizeOrderItems(review.order_items),
    avatar,
    helpfulCount: toNumber(review.helpful_count),
    ownerReply: toStringValue(review.owner_reply),
  };
};

const normalizeSummary = (summary?: RawOwnerReviewSummary): OwnerReviewSummary => ({
  averageRating: toNumber(summary?.average_rating),
  totalReviews: toNumber(summary?.total_reviews),
  fiveStarReviews: toNumber(summary?.five_star_reviews),
  awaitingReply: toNumber(summary?.awaiting_reply),
});

export const fetchOwnerReviews = async () => {
  const response = await apiClient<RawOwnerReviewsResponse>('/owner/reviews');
  const reviews = Array.isArray(response) ? response : response.reviews ?? [];
  const summary = Array.isArray(response) ? undefined : response.summary;

  return {
    summary: normalizeSummary(summary),
    reviews: reviews.map(normalizeReview),
  };
};
