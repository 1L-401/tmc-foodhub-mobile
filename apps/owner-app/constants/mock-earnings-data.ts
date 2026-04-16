export const EARNINGS_BALANCES = [
  {
    id: 'available',
    label: 'Available Balance',
    value: '₱12,450.00',
    growth: '+2.4% from last week',
    icon: 'cash-check',
  },
  {
    id: 'pending',
    label: 'Pending Balance',
    value: '₱4,120.00',
    growth: '+1.2% from last week',
    icon: 'clock-outline',
  },
  {
    id: 'total',
    label: 'Total Earnings',
    value: '₱156,780.00',
    growth: '+5.8% from last month',
    icon: 'chart-line',
  },
];

export const REVENUE_BREAKDOWN = [
  {
    id: 'food_sales',
    label: 'Total Food Sales',
    value: '₱184,200.00',
    isNegative: false,
  },
  {
    id: 'platform_fees',
    label: 'Platform Fees',
    value: '-₱27,630.00',
    isNegative: true,
  },
  {
    id: 'taxes',
    label: 'Taxes',
    value: '-₱9,210.00',
    isNegative: true,
  },
  {
    id: 'net_revenue',
    label: 'Net Revenue',
    value: '₱147,360.00',
    isNegative: false,
    isBold: true,
  },
];

export const EARNINGS_TRENDS_CHART = [
  { label: 'Feb 15', value: 3 },
  { label: 'Feb 16', value: 4 },
  { label: 'Feb 17', value: 2 },
  { label: 'Feb 18', value: 5 },
  { label: 'Feb 19', value: 3 },
  { label: 'Feb 20', value: 7 },
  { label: 'Feb 21', value: 5 },
  { label: 'Feb 22', value: 8 },
  { label: 'Feb 23', value: 12 },
  { label: 'Feb 24', value: 9 },
  { label: 'Feb 25', value: 11 },
  { label: 'Mar 5', value: 7 },
];

export const TOP_SELLING_BY_REVENUE = [
  {
    id: '1',
    name: 'Double Cheese Burger',
    revenue: '₱42,500',
    image: 'https://via.placeholder.com/80/F4F4F4/1A1A1A?text=Burger',
    progress: 0.9,
  },
  {
    id: '2',
    name: 'Grilled Steak',
    revenue: '₱31,200',
    image: 'https://via.placeholder.com/80/F4F4F4/1A1A1A?text=Steak',
    progress: 0.65,
  },
  {
    id: '3',
    name: 'Black Iced Coffee',
    revenue: '₱28,900',
    image: 'https://via.placeholder.com/80/F4F4F4/1A1A1A?text=Coffee',
    progress: 0.5,
  },
];

export interface PayoutHistoryItem {
  id: string;
  referenceId: string;
  datePaid: string;
  amount: number;
  method: string;
  status: 'Completed' | 'Processing' | 'Failed';
}

export const PAYOUT_HISTORY: PayoutHistoryItem[] = [
  {
    id: '1',
    referenceId: 'PAY-2026-9842',
    datePaid: 'Mar 9, 2026',
    amount: 32450.00,
    method: 'Bank Transfer',
    status: 'Completed',
  },
  {
    id: '2',
    referenceId: 'PAY-2026-9104',
    datePaid: 'Mar 2, 2026',
    amount: 28910.00,
    method: 'Bank Transfer',
    status: 'Completed',
  },
];
