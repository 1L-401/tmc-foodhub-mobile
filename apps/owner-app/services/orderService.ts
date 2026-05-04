import { resolveApiMediaUrl } from '@/src/api/apiConfig';
import { apiClient } from '@/src/api/apiClient';

export type OwnerOrderStatus =
  | 'Pending'
  | 'Order Confirmed'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type OwnerPaymentStatus =
  | 'paid'
  | 'rejected'
  | 'awaiting_confirmation'
  | 'pending_verification'
  | 'unpaid';

export type OwnerOrderItemVariation = {
  name?: string;
  addOns?: { name: string; price?: number }[];
};

export type OwnerOrderItem = {
  id: number | string;
  menuItemId?: number | string | null;
  name: string;
  quantity: number;
  qty: number;
  price: number;
  image: string | null;
  variations?: OwnerOrderItemVariation | null;
};

export type OwnerOrder = {
  id: number | string;
  orderNumber: string;
  restaurant: string;
  restaurantId?: number | string | null;
  customer: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryAddress: string;
  contactNumber: string;
  specialInstructions: string;
  note: string;
  items: OwnerOrderItem[];
  itemsSummary: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: OwnerPaymentStatus;
  paymentReceipt: string | null;
  paymentSenderName: string;
  paymentTransactionId: string;
  status: OwnerOrderStatus;
  placedAt: string;
  updatedAt: string;
  time: string;
  timeAgo: string;
  deliveryType: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
};

type RawCustomer = {
  first_name?: unknown;
  last_name?: unknown;
  phone?: unknown;
  address?: unknown;
};

type RawOrderItem = {
  id?: unknown;
  menu_item_id?: unknown;
  item_name?: unknown;
  quantity?: unknown;
  price?: unknown;
  image?: unknown;
  variations?: unknown;
};

type RawOrder = {
  id?: unknown;
  restaurant_owner_id?: unknown;
  store_name?: unknown;
  customer_id?: unknown;
  customer?: RawCustomer | null;
  delivery_address?: unknown;
  contact_number?: unknown;
  special_instructions?: unknown;
  items?: RawOrderItem[];
  subtotal?: unknown;
  delivery_fee?: unknown;
  discount?: unknown;
  total?: unknown;
  payment_method?: unknown;
  payment_status?: unknown;
  payment_receipt?: unknown;
  payment_sender_name?: unknown;
  payment_transaction_id?: unknown;
  status?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
  delivery_type?: unknown;
  scheduled_date?: unknown;
  scheduled_time?: unknown;
};

export const ownerOrderQueryKeys = {
  all: ['owner', 'orders'] as const,
};

export const ORDER_STATUS_FLOW: OwnerOrderStatus[] = [
  'Pending',
  'Order Confirmed',
  'Out for Delivery',
  'Delivered',
];

const toStringValue = (value: unknown, fallback = '') => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return fallback;
};

const toNullableString = (value: unknown) => {
  const resolved = toStringValue(value).trim();
  return resolved.length > 0 ? resolved : null;
};

const toNumber = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildCustomerName = (order: RawOrder) => {
  const firstName = toStringValue(order.customer?.first_name).trim();
  const lastName = toStringValue(order.customer?.last_name).trim();
  const fullName = `${firstName} ${lastName}`.trim();

  if (fullName) {
    return fullName;
  }

  return `Customer #${toStringValue(order.customer_id, 'N/A')}`;
};

const getOrderPrefix = (restaurantName: string) => {
  if (!restaurantName) {
    return 'OD';
  }

  const initials = restaurantName
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return initials.length === 1 ? restaurantName.substring(0, 2).toUpperCase() : initials;
};

const buildOrderNumber = (restaurantName: string, id: number | string) =>
  `${getOrderPrefix(restaurantName)}-${String(id).padStart(5, '0')}`;

const normalizeStatus = (status: unknown): OwnerOrderStatus => {
  const rawStatus = toStringValue(status).toLowerCase();

  if (rawStatus === 'order placed' || rawStatus === 'pending') return 'Pending';
  if (rawStatus === 'being prepared' || rawStatus === 'preparing' || rawStatus === 'order confirmed' || rawStatus === 'confirmed' || rawStatus === 'accepted') return 'Order Confirmed';
  if (rawStatus === 'picked up' || rawStatus === 'delivering' || rawStatus === 'out for delivery' || rawStatus === 'out_for_delivery') return 'Out for Delivery';
  if (rawStatus === 'delivered' || rawStatus === 'completed' || rawStatus === 'done') return 'Delivered';
  if (rawStatus === 'cancelled' || rawStatus === 'canceled') return 'Cancelled';

  return 'Pending';
};

const normalizePaymentStatus = (status: unknown): OwnerPaymentStatus => {
  const rawStatus = toStringValue(status, 'paid');

  if (
    rawStatus === 'paid' ||
    rawStatus === 'rejected' ||
    rawStatus === 'awaiting_confirmation' ||
    rawStatus === 'pending_verification' ||
    rawStatus === 'unpaid'
  ) {
    return rawStatus;
  }

  return 'unpaid';
};

const normalizeVariation = (value: unknown): OwnerOrderItemVariation | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const rawVariation = value as Record<string, unknown>;
  const rawAddOns = Array.isArray(rawVariation.addOns) ? rawVariation.addOns : [];

  return {
    name: toNullableString(rawVariation.name) ?? undefined,
    addOns: rawAddOns
      .filter((addOn): addOn is Record<string, unknown> => typeof addOn === 'object' && addOn !== null)
      .map((addOn) => ({
        name: toStringValue(addOn.name, 'Add-on'),
        price: addOn.price == null ? undefined : toNumber(addOn.price),
      })),
  };
};

const formatTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatTimeAgo = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (diffSeconds < 60) return 'Just now';

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? '' : 's'} ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours === 1 ? '' : 's'} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
};

const buildItemsSummary = (items: OwnerOrderItem[]) => {
  if (items.length === 0) {
    return 'No items';
  }

  return items.map((item) => `${item.quantity}x ${item.name}`).join(', ');
};

export const getNextOrderStatus = (status: OwnerOrderStatus) => {
  const currentIndex = ORDER_STATUS_FLOW.indexOf(status);

  if (currentIndex === -1 || currentIndex >= ORDER_STATUS_FLOW.length - 1) {
    return null;
  }

  return ORDER_STATUS_FLOW[currentIndex + 1];
};

export const getOrderActionLabel = (status: OwnerOrderStatus) => {
  const labels: Partial<Record<OwnerOrderStatus, string>> = {
    Pending: 'Accept',
    'Order Confirmed': 'Out for Delivery',
    'Out for Delivery': 'Delivered',
  };

  return labels[status] ?? null;
};

export const getOrderDetailActionLabel = (status: OwnerOrderStatus) => {
  const labels: Partial<Record<OwnerOrderStatus, string>> = {
    Pending: 'Accept Order',
    'Order Confirmed': 'Mark Out for Delivery',
    'Out for Delivery': 'Mark Delivered',
  };

  return labels[status] ?? null;
};

export const getPaymentMethodLabel = (method: string) => {
  if (method === 'cod') return 'Cash on Delivery';
  if (method === 'gcash') return 'GCash';
  if (method === 'maya') return 'Maya';
  if (method === 'bank_transfer') return 'Bank Transfer';
  return method || 'Unknown';
};

export const getPaymentStatusLabel = (status: OwnerPaymentStatus) => {
  if (status === 'paid') return 'Confirmed';
  if (status === 'rejected') return 'Rejected';
  if (status === 'awaiting_confirmation') return 'Awaiting Confirmation';
  if (status === 'pending_verification') return 'Pending Verification';
  return 'Unpaid';
};

export const isOnlinePayment = (paymentMethod: string) => paymentMethod !== 'cod';

export const normalizeOwnerOrder = (rawOrder: RawOrder): OwnerOrder => {
  const id = toStringValue(rawOrder.id, '0');
  const restaurant = toStringValue(rawOrder.store_name, 'Restaurant');
  const customerName = buildCustomerName(rawOrder);
  const deliveryAddress = toStringValue(rawOrder.delivery_address, 'N/A');
  const contactNumber = toStringValue(rawOrder.contact_number, 'N/A');
  const placedAt = toStringValue(rawOrder.created_at);
  const updatedAt = toStringValue(rawOrder.updated_at, placedAt);

  const items = Array.isArray(rawOrder.items)
    ? rawOrder.items.map((item, index) => {
        const quantity = toNumber(item.quantity);

        return {
          id: toStringValue(item.id, `${id}-${index}`),
          menuItemId: item.menu_item_id == null ? null : toStringValue(item.menu_item_id),
          name: toStringValue(item.item_name, 'Menu item'),
          quantity,
          qty: quantity,
          price: toNumber(item.price),
          image: resolveApiMediaUrl(toNullableString(item.image)),
          variations: normalizeVariation(item.variations),
        };
      })
    : [];

  return {
    id,
    orderNumber: buildOrderNumber(restaurant, id),
    restaurant,
    restaurantId: rawOrder.restaurant_owner_id == null ? null : toStringValue(rawOrder.restaurant_owner_id),
    customer: customerName,
    customerName,
    customerPhone: toStringValue(rawOrder.customer?.phone, contactNumber),
    customerAddress: toStringValue(rawOrder.customer?.address, deliveryAddress),
    deliveryAddress,
    contactNumber,
    specialInstructions: toStringValue(rawOrder.special_instructions),
    note: toStringValue(rawOrder.special_instructions),
    items,
    itemsSummary: buildItemsSummary(items),
    subtotal: toNumber(rawOrder.subtotal),
    deliveryFee: toNumber(rawOrder.delivery_fee),
    discount: toNumber(rawOrder.discount),
    total: toNumber(rawOrder.total),
    paymentMethod: toStringValue(rawOrder.payment_method, 'cod'),
    paymentStatus: normalizePaymentStatus(rawOrder.payment_status),
    paymentReceipt: resolveApiMediaUrl(toNullableString(rawOrder.payment_receipt)),
    paymentSenderName: toStringValue(rawOrder.payment_sender_name),
    paymentTransactionId: toStringValue(rawOrder.payment_transaction_id),
    status: normalizeStatus(rawOrder.status),
    placedAt,
    updatedAt,
    time: formatTime(placedAt),
    timeAgo: formatTimeAgo(placedAt),
    deliveryType: toStringValue(rawOrder.delivery_type, 'asap'),
    scheduledDate: toNullableString(rawOrder.scheduled_date),
    scheduledTime: toNullableString(rawOrder.scheduled_time),
  };
};

export const fetchOwnerOrders = async () => {
  const orders = await apiClient<RawOrder[]>('/owner/orders');
  return orders.map(normalizeOwnerOrder);
};

export const updateOwnerOrderStatus = async (
  id: number | string,
  status: OwnerOrderStatus,
) => {
  const order = await apiClient<RawOrder>(`/owner/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });

  return normalizeOwnerOrder(order);
};

export const confirmOwnerOrderPayment = async (
  id: number | string,
  action: 'confirm' | 'reject',
) =>
  apiClient<{ message: string; payment_status: OwnerPaymentStatus }>(
    `/owner/orders/${id}/confirm-payment`,
    {
      method: 'PUT',
      body: JSON.stringify({ action }),
    },
  );
