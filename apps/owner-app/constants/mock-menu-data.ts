/* ─── Menu Management Mock Data ─── */

export type MenuCategory = 'All Items' | 'Appetizers' | 'Main Courses' | 'Beverages' | 'Sides';
export type StockStatus = 'Available' | 'Low Stock' | 'Out of Stock';
export type SortOption = 'Popularity' | 'Price: Low to High' | 'Price: High to Low' | 'Name A-Z';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image: string;
  isAvailable: boolean;
  isBestSeller: boolean;
  stockStatus: StockStatus;
  rating: number;
  totalReviews: number;
  prepTime: string;
}

export const MENU_CATEGORIES: { key: MenuCategory; label: string }[] = [
  { key: 'All Items', label: 'All Items' },
  { key: 'Appetizers', label: 'Appetizers' },
  { key: 'Main Courses', label: 'Main Courses' },
  { key: 'Beverages', label: 'Beverages' },
  { key: 'Sides', label: 'Sides' },
];

export const CATEGORY_OPTIONS: MenuCategory[] = [
  'Main Courses',
  'Appetizers',
  'Beverages',
  'Sides',
];

export const SORT_OPTIONS: SortOption[] = [
  'Popularity',
  'Price: Low to High',
  'Price: High to Low',
  'Name A-Z',
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Double Cheese Burger',
    description:
      'A classic juicy beef patty layered with fresh lettuce, tomato, and melted cheese in a soft toasted bun.',
    price: 7.0,
    category: 'Main Courses',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop',
    isAvailable: true,
    isBestSeller: true,
    stockStatus: 'Low Stock',
    rating: 4.2,
    totalReviews: 1972,
    prepTime: '20-25 mins',
  },
  {
    id: '2',
    name: 'Grilled Steak',
    description:
      'Juicy, flame-grilled steak cooked to perfection, served with a side of garlic butter and seasonal vegetables.',
    price: 12.0,
    category: 'Main Courses',
    image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=300&h=300&fit=crop',
    isAvailable: true,
    isBestSeller: false,
    stockStatus: 'Available',
    rating: 4.5,
    totalReviews: 843,
    prepTime: '25-30 mins',
  },
  {
    id: '3',
    name: 'Black Iced Coffee',
    description:
      'Bold, smooth brewed coffee served over ice. A refreshing pick-me-up for any time of the day.',
    price: 3.0,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&h=300&fit=crop',
    isAvailable: true,
    isBestSeller: false,
    stockStatus: 'Available',
    rating: 4.0,
    totalReviews: 612,
    prepTime: '5-10 mins',
  },
  {
    id: '4',
    name: 'Spaghetti',
    description:
      'Al dente pasta tossed in a rich, slow-simmered tomato sauce with herbs and ground meat.',
    price: 6.5,
    category: 'Main Courses',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=300&h=300&fit=crop',
    isAvailable: true,
    isBestSeller: false,
    stockStatus: 'Available',
    rating: 4.3,
    totalReviews: 1105,
    prepTime: '15-20 mins',
  },
  {
    id: '5',
    name: 'French Fries',
    description:
      'Crispy golden potato fries, lightly salted and served piping hot. Perfect as a side or snack.',
    price: 4.0,
    category: 'Sides',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&h=300&fit=crop',
    isAvailable: true,
    isBestSeller: false,
    stockStatus: 'Available',
    rating: 4.1,
    totalReviews: 890,
    prepTime: '10-15 mins',
  },
  {
    id: '6',
    name: 'Spring Rolls',
    description:
      'Freshly prepared rolls with seasoned vegetables and savory filling, wrapped in a crispy shell.',
    price: 6.5,
    category: 'Appetizers',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=300&fit=crop',
    isAvailable: false,
    isBestSeller: false,
    stockStatus: 'Out of Stock',
    rating: 3.9,
    totalReviews: 445,
    prepTime: '15-20 mins',
  },
  {
    id: '7',
    name: 'Chicken Wings',
    description:
      'Tender and juicy chicken wings tossed in your choice of BBQ, buffalo, or garlic parmesan sauce.',
    price: 8.5,
    category: 'Appetizers',
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=300&h=300&fit=crop',
    isAvailable: true,
    isBestSeller: false,
    stockStatus: 'Available',
    rating: 4.4,
    totalReviews: 723,
    prepTime: '15-20 mins',
  },
];
