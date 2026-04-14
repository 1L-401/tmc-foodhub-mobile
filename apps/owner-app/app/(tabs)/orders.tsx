import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

/* ─── Types ─── */
type OrderStatus = 'new' | 'preparing' | 'ready';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  items: string;
  total: number;
  paymentMethod: string;
  timeAgo: string;
  status: OrderStatus;
}

/* ─── Mock Orders ─── */
const ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: '#TMC-882041',
    customerName: 'Jane Doe',
    items: '2x Classic Burger, 1x Large Fries',
    total: 24.5,
    paymentMethod: 'GCash',
    timeAgo: '2 mins ago',
    status: 'new',
  },
  {
    id: '2',
    orderNumber: '#TMC-882042',
    customerName: 'Michael Smith',
    items: '1x Pizza Margherita (Large)',
    total: 18.2,
    paymentMethod: 'COD',
    timeAgo: '15 mins ago',
    status: 'preparing',
  },
  {
    id: '3',
    orderNumber: '#TMC-882043',
    customerName: 'Amy Lee',
    items: '3x Street Tacos, 1x Coke Zero',
    total: 32.0,
    paymentMethod: 'COD',
    timeAgo: 'Just Now',
    status: 'new',
  },
  {
    id: '4',
    orderNumber: '#TMC-882044',
    customerName: 'Robert Brown',
    items: '1x Veggie Bowl Special',
    total: 12.5,
    paymentMethod: 'GCash',
    timeAgo: '2 mins ago',
    status: 'ready',
  },
  {
    id: '5',
    orderNumber: '#TMC-882045',
    customerName: 'Kevin White',
    items: '4x Tacos Al Pastor, 1x Horchata',
    total: 15.75,
    paymentMethod: 'COD',
    timeAgo: '15 mins ago',
    status: 'ready',
  },
];

/* ─── Filter Tabs ─── */
type FilterKey = 'all' | 'new' | 'preparing' | 'ready';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
];

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = {
    new: { bg: '#FEF3C7', text: '#B45309', label: 'New' },
    preparing: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Preparing' },
    ready: { bg: '#D1FAE5', text: '#047857', label: 'Ready' },
  }[status];

  return (
    <View style={[badgeStyles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[badgeStyles.text, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

/* ─── Action Button ─── */
function ActionButton({ status }: { status: OrderStatus }) {
  const cfg = {
    new: { bg: '#AC1D10', text: '#FFF', label: 'Accept' },
    preparing: { bg: '#1D4ED8', text: '#FFF', label: 'Ready' },
    ready: { bg: '#E5E7EB', text: '#374151', label: 'Handover' },
  }[status];

  return (
    <Pressable
      style={({ pressed }) => [
        actionStyles.btn,
        { backgroundColor: cfg.bg },
        pressed && actionStyles.pressed,
      ]}>
      <Text style={[actionStyles.text, { color: cfg.text }]}>{cfg.label}</Text>
    </Pressable>
  );
}

/* ─── Order Card ─── */
function OrderCard({ order, index }: { order: Order; index: number }) {
  return (
    <Animated.View
      entering={FadeInRight.delay(200 + index * 80).duration(400)}
      style={styles.orderCard}>
      {/* Top row: order number + badge */}
      <View style={styles.orderTop}>
        <Text style={styles.orderNumber}>{order.orderNumber}</Text>
        <StatusBadge status={order.status} />
      </View>

      {/* Customer */}
      <Text style={styles.orderCustomer}>{order.customerName}</Text>

      {/* Items */}
      <Text style={styles.orderItems}>{order.items}</Text>

      {/* Price */}
      <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>

      {/* Bottom row: meta + action */}
      <View style={styles.orderBottom}>
        <Text style={styles.orderMeta}>
          {order.paymentMethod} • {order.timeAgo}
        </Text>
        <ActionButton status={order.status} />
      </View>
    </Animated.View>
  );
}

/* ─── Main Screen ─── */
export default function OrdersScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Count for badges
  const newCount = ORDERS.filter((o) => o.status === 'new').length;

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let result = ORDERS;

    // Filter by status
    if (activeFilter !== 'all') {
      result = result.filter((o) => o.status === activeFilter);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.items.toLowerCase().includes(q),
      );
    }

    return result;
  }, [activeFilter, searchQuery]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {/* ── Top Bar ── */}
        <Animated.View
          entering={FadeInDown.delay(50).duration(400)}
          style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [pressed && styles.pressed]}
            onPress={() => router.push('/more')}>
            <MaterialCommunityIcons name="menu" size={24} color="#1A1A1A" />
          </Pressable>

          <View style={styles.logoWrap}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoText}>TMC</Text>
            </View>
            <Text style={styles.logoTitle}>
              FOOD{'\n'}
              <Text style={styles.logoBold}>HUB</Text>
            </Text>
          </View>

          <View style={styles.topBarRight}>
            <Pressable style={styles.avatarWrap}>
              <MaterialCommunityIcons
                name="account-circle"
                size={32}
                color="#AC1D10"
              />
            </Pressable>
          </View>
        </Animated.View>

        {/* ── Search ── */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={styles.searchWrap}>
          <MaterialCommunityIcons name="magnify" size={18} color="#AAA" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders, menu..."
            placeholderTextColor="#AAA"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* ── Title ── */}
          <Animated.View entering={FadeInDown.delay(150).duration(400)}>
            <Text style={styles.pageTitle}>Order Management</Text>
            <Text style={styles.pageSubtitle}>
              Manage incoming orders, track their status, and ensure timely
              fulfillment.
            </Text>
          </Animated.View>

          {/* ── Filter Tabs ── */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={styles.filterRow}>
            {FILTERS.map((f) => {
              const isActive = activeFilter === f.key;
              return (
                <Pressable
                  key={f.key}
                  onPress={() => setActiveFilter(f.key)}
                  style={[
                    styles.filterTab,
                    isActive && styles.filterTabActive,
                  ]}>
                  <Text
                    style={[
                      styles.filterText,
                      isActive && styles.filterTextActive,
                    ]}>
                    {f.label}
                  </Text>
                  {f.key === 'new' && newCount > 0 && (
                    <View
                      style={[
                        styles.filterBadge,
                        isActive && styles.filterBadgeActive,
                      ]}>
                      <Text
                        style={[
                          styles.filterBadgeText,
                          isActive && styles.filterBadgeTextActive,
                        ]}>
                        {newCount}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </Animated.View>

          {/* ── Order Cards ── */}
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order, i) => (
              <OrderCard key={order.id} order={order} index={i} />
            ))
          ) : (
            <Animated.View
              entering={FadeInDown.delay(300).duration(400)}
              style={styles.emptyState}>
              <MaterialCommunityIcons
                name="clipboard-text-off-outline"
                size={48}
                color="#CCC"
              />
              <Text style={styles.emptyTitle}>No orders found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Try a different search term'
                  : 'No orders match this filter'}
              </Text>
            </Animated.View>
          )}

          {/* Bottom spacer for tab bar */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* ─── Styles ─── */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F8F8' },
  container: { flex: 1 },
  pressed: { opacity: 0.7 },

  /* Top Bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#AC1D10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#FFF', fontSize: 8, fontWeight: '900' },
  logoTitle: {
    fontSize: 8,
    color: '#1A1A1A',
    fontWeight: '500',
    lineHeight: 10,
  },
  logoBold: { fontWeight: '900', color: '#AC1D10' },
  topBarRight: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FBE7E4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Search */
  searchWrap: {
    marginHorizontal: 16,
    marginBottom: 12,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#1A1A1A' },

  scrollContent: { paddingHorizontal: 16 },

  /* Page Header */
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
    marginBottom: 14,
    lineHeight: 18,
  },

  /* Filter Tabs */
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  filterTabActive: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#FFF',
  },
  filterBadge: {
    backgroundColor: '#AC1D10',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeActive: {
    backgroundColor: '#FFF',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  filterBadgeTextActive: {
    color: '#1A1A1A',
  },

  /* Order Card */
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  orderNumber: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  orderCustomer: { fontSize: 12, color: '#888', marginBottom: 6 },
  orderItems: { fontSize: 13, color: '#555', marginBottom: 4 },
  orderTotal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  orderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderMeta: { fontSize: 11, color: '#AAA' },

  /* Empty State */
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#999',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#BBB',
  },
});

const badgeStyles = StyleSheet.create({
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  text: { fontSize: 10, fontWeight: '700' },
});

const actionStyles = StyleSheet.create({
  btn: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
  text: { fontSize: 12, fontWeight: '700' },
  pressed: { opacity: 0.8 },
});
