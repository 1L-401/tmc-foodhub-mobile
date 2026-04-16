export const PAYOUT_STATS = {
  availableBalance: '₱15,240.00',
  availableSub: '1-3d to bank wallet',
  pendingBalance: '₱152.40',
  pendingSub: 'Estimated arrival in 2-3 days',
  totalPaidOut: '₱124,500.00',
  totalPaidSub: 'Since Sept 2025',
  payoutFrequency: 'Weekly',
  payoutFreqSub: 'Every Monday',
};

export const NEXT_PAYOUT_MOCK = {
  date: 'Monday, Mar 13, 2026',
  amount: '₱12,430.00',
  progress: 85, // percentage
  grossSales: 15097.50,
  commission: -2667.50, // wait the image says 25%? Oh 15%? The image says Commission (25%) -₱2,667.50 but in details it says Commission (15%) -₱1,864.50. We'll use the values directly.
  commissionLabel: 'Commission (15%)',
  commissionValue: -1864.50, // let's stick to the details page logic where net is 12,430.00
  netEarnings: 12430.00,
};

// overriding next payout mock data strictly to match image 1 's "Next Payout" card
NEXT_PAYOUT_MOCK.grossSales = 15097.50;
NEXT_PAYOUT_MOCK.commissionLabel = 'Commission (25%)'; // matching the image blindly
NEXT_PAYOUT_MOCK.commissionValue = -2667.50;
NEXT_PAYOUT_MOCK.netEarnings = 12430.00;


export const PAYOUT_HISTORY = [
  {
    id: 'pay-1',
    refId: 'PAY-2026-9842',
    datePaid: 'Mar 9, 2026',
    amount: 32450.00,
    method: 'Bank Transfer',
    status: 'Completed',
  },
  {
    id: 'pay-2',
    refId: 'PAY-2026-9104',
    datePaid: 'Mar 2, 2026',
    amount: 28910.00,
    method: 'Bank Transfer',
    status: 'Completed',
  },
];

export const PAYOUT_DETAILS_MOCK = {
  id: 'pay-details-1',
  payoutId: '#PAY-88294',
  dateTime: 'Mar 9, 2026, 8:12 AM',
  totalOrders: 43,
  grossRevenue: 15097.50,
  totalCommission: -1864.50,
  finalNetPayout: 12430.00,
  transactions: [
    {
      id: 'ord-1',
      orderId: '#ORD-29938',
      orderTotal: 450.00,
      commission: -67.50,
      netEarnings: 382.50,
    },
    {
      id: 'ord-2',
      orderId: '#ORD-29937',
      orderTotal: 1200.00,
      commission: -180.00,
      netEarnings: 1020.00,
    },
    {
      id: 'ord-3',
      orderId: '#ORD-29936',
      orderTotal: 890.00,
      commission: -133.50,
      netEarnings: 756.50,
    },
    {
      id: 'ord-4',
      orderId: '#ORD-29935',
      orderTotal: 350.00,
      commission: -52.50,
      netEarnings: 297.50,
    },
    {
      id: 'ord-5',
      orderId: '#ORD-29934',
      orderTotal: 2100.00,
      commission: -315.00,
      netEarnings: 1785.00,
    },
  ],
  totalNetAmount: 12430.00,
  payoutMethodStr: 'BDO Bank Transfer **** 4821',
  initiatedOnStr: 'Mar 3, 2026',
  timeline: [
    { id: 't1', label: 'Orders Completed', time: 'Mar 3 - Mar 8', state: 'completed' },
    { id: 't2', label: 'Revenue Calculated', time: 'Mar 9, 12:00 AM', state: 'completed' },
    { id: 't3', label: 'Payout Scheduled', time: 'Mar 9, 9:30 AM', state: 'completed' },
    { id: 't4', label: 'Bank Transfer Initiated', time: 'Mar 9, 2:15 PM', state: 'active' },
    { id: 't5', label: 'Transfer Completed', time: 'Estimated 1-3 working days', state: 'upcoming' },
  ]
};
