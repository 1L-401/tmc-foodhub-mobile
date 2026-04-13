export const CUISINES = [
  { id: '1', name: 'Pizza', icon: 'pizza', color: '#FCECEB', iconColor: '#8E170C' },
  { id: '2', name: 'Burgers', icon: 'hamburger', color: '#FCECEB', iconColor: '#8E170C' },
  { id: '3', name: 'Coffee', icon: 'coffee-outline', color: '#FCECEB', iconColor: '#8E170C' },
  { id: '4', name: 'Cakes', icon: 'cake-variant-outline', color: '#FCECEB', iconColor: '#8E170C' },
  { id: '5', name: 'Ice Cream', icon: 'ice-cream', color: '#FCECEB', iconColor: '#8E170C' },
  { id: '6', name: 'Chicken', icon: 'food-drumstick-outline', color: '#FCECEB', iconColor: '#8E170C' },
  { id: '7', name: 'Noodles', icon: 'noodles', color: '#FCECEB', iconColor: '#8E170C' },
  { id: '8', name: 'Desserts', icon: 'cupcake', color: '#FCECEB', iconColor: '#8E170C' },
];

export const TOP_BRANDS = [
  { id: '1', name: 'Jollibee', icon: 'bee', bgColor: '#FFF8E1' },
  { id: '2', name: "Mcdonald's", icon: 'food', bgColor: '#FFFDE7' },
  { id: '3', name: 'Burger King', icon: 'hamburger', bgColor: '#FFF3E0' },
  { id: '4', name: 'Starbucks', icon: 'coffee', bgColor: '#E8F5E9' },
  { id: '5', name: 'KFC', icon: 'food-drumstick', bgColor: '#FFEBEE' },
  { id: '6', name: 'Chowking', icon: 'noodles', bgColor: '#FCE4EC' },
];

export const ORDER_AGAIN = [
  {
    id: '1',
    name: 'Go Crispy',
    category: 'Fries',
    rating: 4.2,
    reviews: 1972,
    price: 75,
    time: '20-30 mins',
    color: '#334155',
  },
  {
    id: '2',
    name: 'Kuro Broth House',
    category: 'Ramen',
    rating: 4.5,
    reviews: 843,
    price: 75,
    time: '30-40 mins',
    color: '#1E293B',
  },
  {
    id: '3',
    name: 'Manila Grill',
    category: 'Filipino',
    rating: 4.7,
    reviews: 2100,
    price: 90,
    time: '25-35 mins',
    color: '#3B1F0B',
  },
];

export const RESTAURANTS = [
  {
    id: '1',
    name: 'Patty Shack',
    category: 'Burgers • Fries',
    rating: 4.2,
    reviews: 1972,
    price: 85,
    time: '50-60 mins',
    color: '#F5E6D3',
    accent: '#AC1D10',
  },
  {
    id: '2',
    name: 'Cold Brew Collective',
    category: 'Coffee',
    rating: 4.2,
    reviews: 1972,
    price: 100,
    time: '50-60 mins',
    color: '#E8D5C4',
    accent: '#3E2723',
  },
  {
    id: '3',
    name: 'Sushi Sensei',
    category: 'Japanese • Sushi',
    rating: 4.8,
    reviews: 654,
    price: 150,
    time: '35-45 mins',
    color: '#D5E8D4',
    accent: '#1B5E20',
  },
];

export const FILTERS = ['Sort by', 'Cuisines', 'Dietary', 'Ratings'];

export const RESTAURANT_MENU = {
  restaurant: {
    id: '1',
    name: 'Burger King - SM Baguio',
    categories: ['Burgers', 'BBQ'],
    rating: 4.2,
    reviews: 1972,
    isOpen: true,
    distance: '2.5 km radius',
    deliveryTime: '30-45 mins delivery',
    logo: 'https://via.placeholder.com/60/FFFFFF/FDECEA?text=BK',
  },
  menuCategories: ['Popular', 'Group Meals', 'Drinks', 'Desserts'],
  items: [
    {
      id: 'm1',
      title: 'Double Cheese Burger',
      description: 'A classic juicy beef patty layered with melted cheese, lettuce, and tomatoes.',
      price: 7.00,
      rating: 4.2,
      reviews: 1972,
      isBestSeller: true,
      category: 'Popular',
      image: 'https://via.placeholder.com/150/FFF3E0/FB8C00?text=Burger',
    },
    {
      id: 'm2',
      title: 'Grilled Steak',
      description: 'Juicy, flame-grilled steak cooked to perfection with sides.',
      price: 12.00,
      rating: 4.2,
      reviews: 1972,
      isBestSeller: false,
      category: 'Popular',
      image: 'https://via.placeholder.com/150/FFF3E0/FB8C00?text=Steak',
    },
    {
      id: 'm3',
      title: 'Black Iced Coffee',
      description: 'Classic iced black coffee to keep you awake.',
      price: 3.00,
      rating: 4.2,
      reviews: 1972,
      isBestSeller: false,
      category: 'Popular',
      image: 'https://via.placeholder.com/150/FFF3E0/FB8C00?text=Coffee',
    },
    {
      id: 'm4',
      title: 'French Fries',
      description: 'Crispy golden fries cooked fresh.',
      price: 4.00,
      rating: 4.2,
      reviews: 1972,
      isBestSeller: false,
      category: 'Popular',
      image: 'https://via.placeholder.com/150/FFF3E0/FB8C00?text=Fries',
    },
  ],
};

export const RESTAURANT_REVIEWS = {
  restaurantId: '1',
  summary: {
    average: 4.6,
    totalCount: 1248,
    verifiedCount: 1240,
    tags: 'Burgers',
    distribution: [
      { score: 5, count: 864, percentage: 69 },
      { score: 4, count: 242, percentage: 19 },
      { score: 3, count: 98, percentage: 8 },
      { score: 2, count: 30, percentage: 2 },
      { score: 1, count: 14, percentage: 1 },
    ],
  },
  reviews: [
    {
      id: 'r1',
      name: 'Maria L.',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      time: '2 hours ago',
      rating: 5,
      text: 'The Lumpiang Shanghai is so crispy and still hot when it arrived! SM Baguio branch never fails to deliver quality food. Highly recommended for family dinners.',
      photos: [
        'https://via.placeholder.com/150/FFF3E0/FB8C00?text=Food'
      ],
      helpfulCount: 8,
    },
    {
      id: 'r2',
      name: 'James T.',
      avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
      time: 'Yesterday at 2:30 pm',
      rating: 5,
      text: 'Great food as always. Delivery was a bit slow today due to the rain, but the rider was very polite and the packaging kept everything dry.',
      photos: [],
      helpfulCount: 29,
    }
  ]
};

