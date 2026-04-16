export const ANALYTICS_STATS = [
  {
    id: 'revenue',
    label: 'Total Revenue',
    value: '₱42,910.00',
    growth: '+18.5%',
    isPositive: true,
    comparison: 'vs. ₱38,170 last month',
  },
  {
    id: 'avg_order',
    label: 'Avg. Order Value',
    value: '₱152.40',
    growth: '+5.8%',
    isPositive: true,
    comparison: 'vs. ₱138.10 last month',
  },
  {
    id: 'total_orders',
    label: 'Total Orders',
    value: '1,324',
    growth: '-2.1%',
    isPositive: false,
    comparison: 'vs. 1,352 last month',
  },
  {
    id: 'new_customers',
    label: 'New Customers',
    value: '421',
    growth: '+12%',
    isPositive: true,
    comparison: 'vs. 358 last month',
  },
];

export const SALES_REVENUE_CHART = [
  { label: 'Feb 27', thisPeriod: 15, lastPeriod: 25 },
  { label: 'Feb 28', thisPeriod: 22, lastPeriod: 32 },
  { label: 'Mar 1', thisPeriod: 12, lastPeriod: 27 },
  { label: 'Mar 2', thisPeriod: 35, lastPeriod: 35 },
  { label: 'Mar 3', thisPeriod: 32, lastPeriod: 45 },
  { label: 'Mar 4', thisPeriod: 28, lastPeriod: 38 },
  { label: 'Mar 5', thisPeriod: 48, lastPeriod: 48 },
];

export const TOP_SELLING_ITEMS = [
  {
    id: '1',
    name: 'Double Cheese Burger',
    orders: 852,
    image: 'https://via.placeholder.com/80/F4F4F4/1A1A1A?text=Burger',
    progress: 0.9,
  },
  {
    id: '2',
    name: 'Grilled Steak',
    orders: 242,
    image: 'https://via.placeholder.com/80/F4F4F4/1A1A1A?text=Steak',
    progress: 0.7,
  },
  {
    id: '3',
    name: 'Black Iced Coffee',
    orders: 188,
    image: 'https://via.placeholder.com/80/F4F4F4/1A1A1A?text=Coffee',
    progress: 0.5,
  },
];

// Heatmap colors from low to high:
// 1 = lightest beige, 2 = light red/beige, 3 = medium red, 4 = dark red, 5 = darkest red
export const HEATMAP_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const HEATMAP_HOURS = ['10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'];
// 7 rows (days), 7 cols (hours)
export const ORDER_PATTERNS_HEATMAP = [
  [1, 4, 1, 4, 4, 4, 3], // Mon
  [4, 3, 4, 3, 1, 4, 4], // Tue
  [1, 4, 4, 2, 3, 2, 3], // Wed
  [3, 2, 1, 4, 4, 4, 3], // Thu
  [4, 1, 4, 1, 4, 4, 1], // Fri
  [3, 1, 4, 4, 4, 4, 3], // Sat
  [4, 4, 3, 4, 1, 4, 4], // Sun
];

export interface AnalyticsOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: 'In progress' | 'Pending' | 'Delivered';
  avatar: string;
}

export const RECENT_HIGH_VALUE_ORDERS: AnalyticsOrder[] = [
  {
    id: '1',
    orderNumber: '#6842',
    customerName: 'Jane Doe',
    total: 583.20,
    status: 'In progress',
    avatar: 'https://via.placeholder.com/40/E8E8E8/999?text=JD',
  },
  {
    id: '2',
    orderNumber: '#6841',
    customerName: 'Michael Smith',
    total: 453.10,
    status: 'Pending',
    avatar: 'https://via.placeholder.com/40/E8E8E8/999?text=MS',
  },
  {
    id: '3',
    orderNumber: '#6840',
    customerName: 'Amy Lee',
    total: 259.00,
    status: 'Delivered',
    avatar: 'https://via.placeholder.com/40/E8E8E8/999?text=AL',
  },
  {
    id: '4',
    orderNumber: '#6839',
    customerName: 'Robert Brown',
    total: 195.50,
    status: 'Delivered',
    avatar: 'https://via.placeholder.com/40/E8E8E8/999?text=RB',
  },
];
