export const RESTAURANT_NAME = 'Patty Shack!';

export const STATS = {
  todaysOrders: 142,
  todaysOrdersGrowth: '+12% from yesterday',
  activeOrders: 12,
  activeOrdersGrowth: '+15% this week',
};

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  items: string;
  total: number;
  paymentMethod: string;
  timeAgo: string;
  status: 'new' | 'preparing' | 'ready';
}

export const RECENT_ORDERS: RecentOrder[] = [
  {
    id: '1',
    orderNumber: '#8842',
    customerName: 'Jane Doe',
    items: '2x Classic Burger, 1x Large Fries',
    total: 24.50,
    paymentMethod: 'GCash',
    timeAgo: '2 mins ago',
    status: 'new',
  },
  {
    id: '2',
    orderNumber: '#8841',
    customerName: 'Michael Smith',
    items: '1x Pizza Margherita (Large)',
    total: 18.20,
    paymentMethod: 'COD',
    timeAgo: '15 mins ago',
    status: 'preparing',
  },
  {
    id: '3',
    orderNumber: '#8840',
    customerName: 'Amy Lee',
    items: '3x Street Tacos, 1x Coke Zero',
    total: 32.00,
    paymentMethod: 'COD',
    timeAgo: '23 mins ago',
    status: 'ready',
  },
];

export interface PopularMenuItem {
  id: string;
  name: string;
  ordersThisWeek: number;
  price: number;
  image: string;
}

export const POPULAR_MENU: PopularMenuItem[] = [
  {
    id: '1',
    name: 'Double Cheese Burger',
    ordersThisWeek: 358,
    price: 7.00,
    image: 'https://via.placeholder.com/80/F4F4F4/1A1A1A?text=Burger',
  },
  {
    id: '2',
    name: 'Grilled Steak',
    ordersThisWeek: 242,
    price: 12.00,
    image: 'https://via.placeholder.com/80/F4F4F4/1A1A1A?text=Steak',
  },
  {
    id: '3',
    name: 'Black Iced Coffee',
    ordersThisWeek: 188,
    price: 3.00,
    image: 'https://via.placeholder.com/80/F4F4F4/1A1A1A?text=Coffee',
  },
];

export const SALES_DATA = [
  { label: 'Mon', value: 40 },
  { label: 'Tue', value: 65 },
  { label: 'Wed', value: 55 },
  { label: 'Thu', value: 78 },
  { label: 'Fri', value: 90 },
  { label: 'Sat', value: 70 },
  { label: 'Sun', value: 50 },
];

export interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  review: string;
  avatar: string;
}

export const RECENT_REVIEWS: ReviewItem[] = [
  {
    id: '1',
    name: 'Maria L.',
    rating: 5,
    review:
      'The Lumpiang Shanghai is so crispy and still hot when it arrived! SM Baguio branch never fails to deliver quality food. Highly recommended for family dinners.',
    avatar: 'https://via.placeholder.com/40/E8E8E8/999?text=ML',
  },
  {
    id: '2',
    name: 'James T.',
    rating: 4,
    review:
      'Great food as always. Delivery was a bit slow today due to the rain, but the rider was very polite and the packaging kept everything dry.',
    avatar: 'https://via.placeholder.com/40/E8E8E8/999?text=JT',
  },
];
