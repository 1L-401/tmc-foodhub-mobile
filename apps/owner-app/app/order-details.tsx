import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

/* ─── Types ─── */
type OrderStatus = 'new' | 'preparing' | 'ready';

interface OrderItem {
  name: string;
  qty: number;
  price: number;
  notes?: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'unpaid';
  timeAgo: string;
  placedAt: string;
  status: OrderStatus;
  deliveryType: 'delivery' | 'pickup';
  specialInstructions?: string;
}

/* ─── Mock Order Details ─── */
const ORDER_DETAILS: Record<string, OrderDetail> = {
  '1': {
    id: '1',
    orderNumber: '#TMC-882041',
    customerName: 'Jane Doe',
    customerPhone: '+63 912 345 6789',
    customerAddress: '123 Session Rd, Baguio City',
    items: [
      { name: 'Classic Burger', qty: 2, price: 8.50, notes: 'No onions' },
      { name: 'Large Fries', qty: 1, price: 4.50 },
      { name: 'Iced Tea (Regular)', qty: 2, price: 1.50 },
    ],
    subtotal: 24.50,
    deliveryFee: 3.00,
    discount: 3.00,
    total: 24.50,
    paymentMethod: 'GCash',
    paymentStatus: 'paid',
    timeAgo: '2 mins ago',
    placedAt: 'Apr 14, 2026 — 4:32 PM',
    status: 'new',
    deliveryType: 'delivery',
    specialInstructions: 'Please ring the doorbell twice. Gate code: 1234',
  },
  '2': {
    id: '2',
    orderNumber: '#TMC-882042',
    customerName: 'Michael Smith',
    customerPhone: '+63 917 654 3210',
    customerAddress: '45 Abanao St, Baguio City',
    items: [
      { name: 'Pizza Margherita (Large)', qty: 1, price: 18.20 },
    ],
    subtotal: 18.20,
    deliveryFee: 2.50,
    discount: 2.50,
    total: 18.20,
    paymentMethod: 'COD',
    paymentStatus: 'unpaid',
    timeAgo: '15 mins ago',
    placedAt: 'Apr 14, 2026 — 4:17 PM',
    status: 'preparing',
    deliveryType: 'pickup',
  },
  '3': {
    id: '3',
    orderNumber: '#TMC-882043',
    customerName: 'Amy Lee',
    customerPhone: '+63 918 111 2222',
    customerAddress: '88 Burnham Park, Baguio City',
    items: [
      { name: 'Street Tacos', qty: 3, price: 6.00 },
      { name: 'Coke Zero', qty: 1, price: 2.50 },
      { name: 'Churros', qty: 1, price: 5.50 },
    ],
    subtotal: 26.50,
    deliveryFee: 3.00,
    discount: 0,
    total: 29.50,
    paymentMethod: 'COD',
    paymentStatus: 'unpaid',
    timeAgo: 'Just Now',
    placedAt: 'Apr 14, 2026 — 4:50 PM',
    status: 'new',
    deliveryType: 'delivery',
    specialInstructions: 'Extra salsa on the side please',
  },
  '4': {
    id: '4',
    orderNumber: '#TMC-882044',
    customerName: 'Robert Brown',
    customerPhone: '+63 920 333 4444',
    customerAddress: '12 Camp John Hay, Baguio City',
    items: [
      { name: 'Veggie Bowl Special', qty: 1, price: 12.50 },
    ],
    subtotal: 12.50,
    deliveryFee: 2.00,
    discount: 2.00,
    total: 12.50,
    paymentMethod: 'GCash',
    paymentStatus: 'paid',
    timeAgo: '2 mins ago',
    placedAt: 'Apr 14, 2026 — 4:48 PM',
    status: 'ready',
    deliveryType: 'pickup',
  },
  '5': {
    id: '5',
    orderNumber: '#TMC-882045',
    customerName: 'Kevin White',
    customerPhone: '+63 921 555 6666',
    customerAddress: '77 Leonard Wood Rd, Baguio City',
    items: [
      { name: 'Tacos Al Pastor', qty: 4, price: 3.00 },
      { name: 'Horchata', qty: 1, price: 3.75 },
    ],
    subtotal: 15.75,
    deliveryFee: 2.50,
    discount: 2.50,
    total: 15.75,
    paymentMethod: 'COD',
    paymentStatus: 'unpaid',
    timeAgo: '15 mins ago',
    placedAt: 'Apr 14, 2026 — 4:35 PM',
    status: 'ready',
    deliveryType: 'delivery',
  },
};

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = {
    new: { bg: '#FEF3C7', text: '#B45309', label: '● New Order' },
    preparing: { bg: '#DBEAFE', text: '#1D4ED8', label: '● Preparing' },
    ready: { bg: '#D1FAE5', text: '#047857', label: '● Ready' },
  }[status];

  return (
    <View style={[badgeStyles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[badgeStyles.text, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

/* ─── Payment Badge ─── */
function PaymentBadge({ status }: { status: 'paid' | 'unpaid' }) {
  const isPaid = status === 'paid';
  return (
    <View
      style={[
        badgeStyles.badge,
        { backgroundColor: isPaid ? '#D1FAE5' : '#FEF3C7' },
      ]}>
      <Text
        style={[
          badgeStyles.text,
          { color: isPaid ? '#047857' : '#B45309' },
        ]}>
        {isPaid ? '✓ Paid' : '○ Unpaid'}
      </Text>
    </View>
  );
}

/* ─── Timeline Step ─── */
function TimelineStep({
  icon,
  title,
  subtitle,
  isActive,
  isCompleted,
  isLast,
}: {
  icon: string;
  title: string;
  subtitle: string;
  isActive: boolean;
  isCompleted: boolean;
  isLast: boolean;
}) {
  const dotColor = isCompleted ? '#047857' : isActive ? '#AC1D10' : '#D0D0D0';
  const lineColor = isCompleted ? '#047857' : '#E8E8E8';

  return (
    <View style={timelineStyles.step}>
      {/* Dot + Line */}
      <View style={timelineStyles.dotCol}>
        <View
          style={[
            timelineStyles.dot,
            { backgroundColor: dotColor },
            isActive && timelineStyles.dotActive,
          ]}>
          <MaterialCommunityIcons
            name={isCompleted ? 'check' : (icon as any)}
            size={12}
            color="#FFF"
          />
        </View>
        {!isLast && (
          <View style={[timelineStyles.line, { backgroundColor: lineColor }]} />
        )}
      </View>

      {/* Content */}
      <View style={timelineStyles.content}>
        <Text
          style={[
            timelineStyles.title,
            (isActive || isCompleted) && timelineStyles.titleActive,
          ]}>
          {title}
        </Text>
        <Text style={timelineStyles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

/* ─── Order Timeline ─── */
function OrderTimeline({ status }: { status: OrderStatus }) {
  const statusIndex = { new: 0, preparing: 1, ready: 2 }[status];

  const steps = [
    {
      icon: 'bell-outline',
      title: 'Order Placed',
      subtitle: 'Customer submitted the order',
    },
    {
      icon: 'chef-hat',
      title: 'Preparing',
      subtitle: 'Kitchen is working on it',
    },
    {
      icon: 'check-circle-outline',
      title: 'Ready',
      subtitle: 'Ready for pickup / delivery',
    },
  ];

  return (
    <View style={timelineStyles.container}>
      {steps.map((step, i) => (
        <TimelineStep
          key={step.title}
          icon={step.icon}
          title={step.title}
          subtitle={step.subtitle}
          isActive={i === statusIndex}
          isCompleted={i < statusIndex}
          isLast={i === steps.length - 1}
        />
      ))}
    </View>
  );
}

/* ─── Info Row Helper ─── */
function InfoRow({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: string;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={infoStyles.row}>
      <View style={infoStyles.iconWrap}>
        <MaterialCommunityIcons
          name={icon as any}
          size={16}
          color="#999"
        />
      </View>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={[infoStyles.value, valueColor ? { color: valueColor } : undefined]}>
        {value}
      </Text>
    </View>
  );
}

/* ─── Action Button ─── */
function OrderActionButton({ status }: { status: OrderStatus }) {
  const cfg = {
    new: {
      bg: '#AC1D10',
      text: '#FFF',
      label: 'Accept Order',
      icon: 'check-circle-outline',
    },
    preparing: {
      bg: '#1D4ED8',
      text: '#FFF',
      label: 'Mark as Ready',
      icon: 'silverware-fork-knife',
    },
    ready: {
      bg: '#047857',
      text: '#FFF',
      label: 'Complete Handover',
      icon: 'hand-extended-outline',
    },
  }[status];

  return (
    <Pressable
      style={({ pressed }) => [
        actionBtnStyles.primary,
        { backgroundColor: cfg.bg },
        pressed && actionBtnStyles.pressed,
      ]}>
      <MaterialCommunityIcons
        name={cfg.icon as any}
        size={18}
        color={cfg.text}
      />
      <Text style={[actionBtnStyles.primaryText, { color: cfg.text }]}>
        {cfg.label}
      </Text>
    </Pressable>
  );
}

/* ─── Main Screen ─── */
export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const order = ORDER_DETAILS[id ?? '1'];

  if (!order) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color="#CCC"
          />
          <Text style={styles.notFoundText}>Order not found</Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backBtn,
              pressed && { opacity: 0.7 },
            ]}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {/* ── Header ── */}
        <Animated.View
          entering={FadeInDown.delay(50).duration(350)}
          style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.headerBtn,
              pressed && { opacity: 0.6 },
            ]}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color="#1A1A1A"
            />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Order Details</Text>
            <Text style={styles.headerSubtitle}>{order.orderNumber}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.headerBtn,
              pressed && { opacity: 0.6 },
            ]}>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={22}
              color="#1A1A1A"
            />
          </Pressable>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* ── Status Card ── */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={styles.statusCard}>
            <View style={styles.statusTop}>
              <View>
                <Text style={styles.orderNum}>{order.orderNumber}</Text>
                <Text style={styles.orderDate}>{order.placedAt}</Text>
              </View>
              <StatusBadge status={order.status} />
            </View>

            {/* Timeline */}
            <OrderTimeline status={order.status} />
          </Animated.View>

          {/* ── Customer Info ── */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="account-outline"
                size={18}
                color="#AC1D10"
              />
              <Text style={styles.cardTitle}>Customer Information</Text>
            </View>

            <InfoRow
              icon="account"
              label="Name"
              value={order.customerName}
            />
            <InfoRow
              icon="phone-outline"
              label="Phone"
              value={order.customerPhone}
            />
            <InfoRow
              icon={order.deliveryType === 'delivery' ? 'map-marker-outline' : 'store-outline'}
              label={order.deliveryType === 'delivery' ? 'Address' : 'Pickup'}
              value={
                order.deliveryType === 'delivery'
                  ? order.customerAddress
                  : 'Store Pickup'
              }
            />
            <InfoRow
              icon="truck-delivery-outline"
              label="Type"
              value={order.deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}
            />
          </Animated.View>

          {/* ── Order Items ── */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(400)}
            style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="clipboard-list-outline"
                size={18}
                color="#AC1D10"
              />
              <Text style={styles.cardTitle}>
                Order Items ({order.items.length})
              </Text>
            </View>

            {order.items.map((item, i) => (
              <Animated.View
                key={`${item.name}-${i}`}
                entering={FadeInRight.delay(350 + i * 60).duration(350)}
                style={[
                  itemStyles.row,
                  i < order.items.length - 1 && itemStyles.rowBorder,
                ]}>
                <View style={itemStyles.qtyBadge}>
                  <Text style={itemStyles.qtyText}>{item.qty}x</Text>
                </View>
                <View style={itemStyles.info}>
                  <Text style={itemStyles.name}>{item.name}</Text>
                  {item.notes && (
                    <Text style={itemStyles.notes}>📝 {item.notes}</Text>
                  )}
                </View>
                <Text style={itemStyles.price}>
                  ${(item.qty * item.price).toFixed(2)}
                </Text>
              </Animated.View>
            ))}

            {/* Special Instructions */}
            {order.specialInstructions && (
              <View style={itemStyles.instructions}>
                <MaterialCommunityIcons
                  name="message-text-outline"
                  size={14}
                  color="#B45309"
                />
                <Text style={itemStyles.instructionsText}>
                  {order.specialInstructions}
                </Text>
              </View>
            )}
          </Animated.View>

          {/* ── Payment Summary ── */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(400)}
            style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="credit-card-outline"
                size={18}
                color="#AC1D10"
              />
              <Text style={styles.cardTitle}>Payment Summary</Text>
              <PaymentBadge status={order.paymentStatus} />
            </View>

            <View style={summaryStyles.row}>
              <Text style={summaryStyles.label}>Subtotal</Text>
              <Text style={summaryStyles.value}>
                ${order.subtotal.toFixed(2)}
              </Text>
            </View>
            <View style={summaryStyles.row}>
              <Text style={summaryStyles.label}>Delivery Fee</Text>
              <Text style={summaryStyles.value}>
                ${order.deliveryFee.toFixed(2)}
              </Text>
            </View>
            {order.discount > 0 && (
              <View style={summaryStyles.row}>
                <Text style={summaryStyles.label}>Discount</Text>
                <Text style={[summaryStyles.value, { color: '#047857' }]}>
                  -${order.discount.toFixed(2)}
                </Text>
              </View>
            )}
            <View style={summaryStyles.divider} />
            <View style={summaryStyles.row}>
              <Text style={summaryStyles.totalLabel}>Total</Text>
              <Text style={summaryStyles.totalValue}>
                ${order.total.toFixed(2)}
              </Text>
            </View>

            <View style={summaryStyles.paymentMethod}>
              <MaterialCommunityIcons
                name={
                  order.paymentMethod === 'GCash'
                    ? 'cellphone'
                    : 'cash'
                }
                size={16}
                color="#666"
              />
              <Text style={summaryStyles.paymentText}>
                Paid via {order.paymentMethod}
              </Text>
            </View>
          </Animated.View>

          {/* ── Action Buttons ── */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(400)}
            style={styles.actionsCard}>
            <OrderActionButton status={order.status} />

            {order.status === 'new' && (
              <Pressable
                style={({ pressed }) => [
                  actionBtnStyles.secondary,
                  pressed && actionBtnStyles.pressed,
                ]}>
                <MaterialCommunityIcons
                  name="close-circle-outline"
                  size={18}
                  color="#DC2626"
                />
                <Text style={actionBtnStyles.secondaryText}>
                  Decline Order
                </Text>
              </Pressable>
            )}

            <Pressable
              style={({ pressed }) => [
                actionBtnStyles.outline,
                pressed && actionBtnStyles.pressed,
              ]}>
              <MaterialCommunityIcons
                name="printer-outline"
                size={18}
                color="#555"
              />
              <Text style={actionBtnStyles.outlineText}>Print Receipt</Text>
            </Pressable>
          </Animated.View>

          {/* Bottom spacer */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* ─── Styles ─── */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F8F8' },
  container: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  notFoundText: { fontSize: 16, fontWeight: '600', color: '#999' },
  backBtn: {
    marginTop: 8,
    backgroundColor: '#AC1D10',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  headerSubtitle: { fontSize: 11, color: '#999', marginTop: 1 },

  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },

  /* Status Card */
  statusCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statusTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderNum: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  orderDate: { fontSize: 12, color: '#999', marginTop: 2 },

  /* Card */
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },

  /* Actions Card */
  actionsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 10,
  },
});

const badgeStyles = StyleSheet.create({
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  text: { fontSize: 11, fontWeight: '700' },
});

const timelineStyles = StyleSheet.create({
  container: { gap: 0 },
  step: { flexDirection: 'row', minHeight: 48 },
  dotCol: { alignItems: 'center', width: 32 },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    shadowColor: '#AC1D10',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  line: { flex: 1, width: 2, marginVertical: 3, borderRadius: 1 },
  content: { flex: 1, paddingLeft: 10, paddingBottom: 12 },
  title: { fontSize: 13, fontWeight: '600', color: '#BBB' },
  titleActive: { color: '#1A1A1A' },
  subtitle: { fontSize: 11, color: '#CCC', marginTop: 1 },
});

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  iconWrap: { width: 28, alignItems: 'center' },
  label: { fontSize: 12, color: '#999', width: 64, fontWeight: '500' },
  value: { flex: 1, fontSize: 13, color: '#1A1A1A', fontWeight: '600' },
});

const itemStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  qtyBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FBE7E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: { fontSize: 12, fontWeight: '800', color: '#AC1D10' },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  notes: { fontSize: 11, color: '#B45309', marginTop: 2 },
  price: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  instructions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  instructionsText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
    fontWeight: '500',
  },
});

const summaryStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: { fontSize: 13, color: '#888' },
  value: { fontSize: 13, color: '#1A1A1A', fontWeight: '500' },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },
  totalLabel: { fontSize: 15, fontWeight: '800', color: '#1A1A1A' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#AC1D10' },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: '#F8F8F8',
    padding: 10,
    borderRadius: 10,
  },
  paymentText: { fontSize: 12, color: '#666', fontWeight: '500' },
});

const actionBtnStyles = StyleSheet.create({
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  primaryText: { fontSize: 15, fontWeight: '700' },
  secondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  secondaryText: { fontSize: 15, fontWeight: '700', color: '#DC2626' },
  outline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  outlineText: { fontSize: 15, fontWeight: '600', color: '#555' },
  pressed: { opacity: 0.7 },
});
