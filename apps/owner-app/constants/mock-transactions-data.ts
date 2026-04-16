export const TRANSACTIONS_STATS = [
  {
    id: 'total_tx',
    label: 'Total Transactions',
    value: '1,582',
    growth: '+12%',
    isPositive: true,
    icon: 'text-box-outline',
  },
  {
    id: 'order_rev',
    label: 'Order Revenue',
    value: '₱450,200.00',
    growth: '+8.5%',
    isPositive: true,
    icon: 'cash-register',
  },
  {
    id: 'platform_comm',
    label: 'Platform Commission',
    value: '₱45,020.00',
    growth: '-2.1%',
    isPositive: false,
    icon: 'percent-outline',
  },
  {
    id: 'net_earning',
    label: 'Net Earnings',
    value: '₱405,180.00',
    growth: '+10.2%',
    isPositive: true,
    icon: 'cash-multiple',
  },
];

export interface TransactionItem {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  itemsSummary: string;
  total: number;
  net: number;
  commission: number;
  dateStr: string;
  timeStr: string;
  method: string;
  status: 'Paid Out' | 'Pending' | 'Refunded';
}

export const RECENT_TRANSACTIONS: TransactionItem[] = [
  {
    id: 'tx-1',
    orderId: '#TMC- 8821',
    customerName: 'Maria Santos',
    customerEmail: 'maria.santos@email.com',
    itemsSummary: '2x Burger,\n1x Fries',
    total: 450.00,
    net: 405.00,
    commission: 45.00,
    dateStr: 'Mar 9, 2026',
    timeStr: '8:12 AM',
    method: 'GCash',
    status: 'Paid Out',
  },
  {
    id: 'tx-2',
    orderId: '#TMC- 8819',
    customerName: 'Antonio Rizal',
    customerEmail: 'antonio.rizal@email.com',
    itemsSummary: '1x Family\nBucket',
    total: 820.00,
    net: 738.00,
    commission: 82.00,
    dateStr: 'Mar 9, 2026',
    timeStr: '9:47 AM',
    method: 'Maya',
    status: 'Pending',
  },
  {
    id: 'tx-3',
    orderId: '#TMC- 8815',
    customerName: 'Elena Cruz',
    customerEmail: 'elena.cruz@email.com',
    itemsSummary: '3x Ramen\nSpecial',
    total: 1050.00,
    net: 945.00,
    commission: 105.00,
    dateStr: 'Mar 9, 2026',
    timeStr: '10:15 AM',
    method: 'COD',
    status: 'Paid Out',
  },
  {
    id: 'tx-4',
    orderId: '#TMC- 8810',
    customerName: 'Jose Gomez',
    customerEmail: 'jose.gomez@email.com',
    itemsSummary: '1x Large Pizza',
    total: 550.00,
    net: 495.00,
    commission: 55.00,
    dateStr: 'Mar 9, 2026',
    timeStr: '11:20 AM',
    method: 'Card',
    status: 'Refunded',
  },
];

export const TRANSACTION_DETAILS_MOCK = {
  id: 'tx-1',
  orderNumber: '#TMC-88291',
  processDate: 'Mar 9, 2026, 8:12 AM',
  customer: {
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '+63 912 345 6789',
  },
  delivery: {
    address: '123 Quezon Avenue\nBrgy. Paligsahan, Quezon City, Metro Manila, 1103',
    mapImage: 'https://via.placeholder.com/600x250/E5E5E5/999?text=Map+View',
  },
  items: [
    {
      id: 'i1',
      name: 'Double Cheese Burger',
      qty: 2,
      unitPrice: 245.00,
      total: 490.00,
      image: 'https://via.placeholder.com/80/F4F4F4/1A1A1A?text=Burger',
    },
    {
      id: 'i2',
      name: 'Grilled Steak',
      qty: 2,
      unitPrice: 85.00, // example price from image
      total: 170.00,
      image: 'https://via.placeholder.com/80/F4F4F4/1A1A1A?text=Steak',
    },
    {
      id: 'i3',
      name: 'Black Iced Coffee',
      qty: 1,
      unitPrice: 45.00,
      total: 45.00,
      image: 'https://via.placeholder.com/80/F4F4F4/1A1A1A?text=Coffee',
    },
  ],
  financials: {
    subtotal: 705.00,
    deliveryFee: 49.00,
    platformCommission: -105.75, // 15%
    vat: 84.60, // 12%
    netEarnings: 732.85,
  },
  payoutStatus: [
    { id: '1', label: 'Order Completed', time: 'Mar 9, 2026 8:12 AM', state: 'completed' },
    { id: '2', label: 'Revenue Added', time: 'Funds added to merchant wallet', state: 'completed' },
    { id: '3', label: 'Pending Balance', time: 'Verifying transaction details', state: 'pending' },
    { id: '4', label: 'Scheduled Payout', time: 'Expected: Mar 13, 2026', state: 'upcoming' },
    { id: '5', label: 'Transferred', time: 'Bank Transfer / GCash', state: 'upcoming' },
  ],
};
