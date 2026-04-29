import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  fetchOwnerOrders,
  getNextOrderStatus,
  getOrderActionLabel,
  getPaymentMethodLabel,
  ownerOrderQueryKeys,
  updateOwnerOrderStatus,
  type OwnerOrder,
  type OwnerOrderStatus,
} from '@/services/orderService';

type FilterKey = 'All' | 'Pending' | 'Order Confirmed' | 'Out for Delivery' | 'Delivered';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'All', label: 'All' },
  { key: 'Pending', label: 'Pending' },
  { key: 'Order Confirmed', label: 'Confirmed' },
  { key: 'Out for Delivery', label: 'Out for Delivery' },
  { key: 'Delivered', label: 'Complete' },
];

const formatCurrency = (amount: number) => `PHP ${Number(amount || 0).toFixed(2)}`;

function StatusBadge({ status }: { status: OwnerOrderStatus }) {
  const cfg = {
    Pending: { bg: '#FEF3C7', text: '#B45309', label: 'Pending' },
    'Order Confirmed': { bg: '#DBEAFE', text: '#1D4ED8', label: 'Confirmed' },
    'Out for Delivery': { bg: '#CFFAFE', text: '#0891B2', label: 'Out for Delivery' },
    Delivered: { bg: '#D1FAE5', text: '#047857', label: 'Delivered' },
    Cancelled: { bg: '#FEE2E2', text: '#DC2626', label: 'Cancelled' },
  }[status];

  return (
    <View style={[badgeStyles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[badgeStyles.text, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

function ActionButton({
  status,
  disabled,
  onPress,
}: {
  status: OwnerOrderStatus;
  disabled: boolean;
  onPress: () => void;
}) {
  const label = getOrderActionLabel(status);

  if (!label) {
    return null;
  }

  const cfgByStatus: Partial<Record<OwnerOrderStatus, { bg: string; text: string }>> = {
    Pending: { bg: '#AC1D10', text: '#FFF' },
    'Order Confirmed': { bg: '#1D4ED8', text: '#FFF' },
    'Out for Delivery': { bg: '#047857', text: '#FFF' },
  };
  const cfg = cfgByStatus[status] ?? { bg: '#E5E7EB', text: '#374151' };

  return (
    <Pressable
      disabled={disabled}
      onPress={(event) => {
        event.stopPropagation();
        onPress();
      }}
      style={({ pressed }) => [
        actionStyles.btn,
        { backgroundColor: cfg.bg },
        pressed && actionStyles.pressed,
        disabled && actionStyles.disabled,
      ]}>
      {disabled ? (
        <ActivityIndicator size="small" color={cfg.text} />
      ) : (
        <Text style={[actionStyles.text, { color: cfg.text }]}>{label}</Text>
      )}
    </Pressable>
  );
}

function OrderCard({
  order,
  index,
  isUpdating,
  onAdvance,
}: {
  order: OwnerOrder;
  index: number;
  isUpdating: boolean;
  onAdvance: (order: OwnerOrder) => void;
}) {
  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: '/order-details', params: { id: String(order.id) } })
      }>
      <Animated.View
        entering={FadeInRight.delay(120 + index * 60).duration(350)}
        style={styles.orderCard}>
        <View style={styles.orderTop}>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          <StatusBadge status={order.status} />
        </View>

        <Text style={styles.orderCustomer}>{order.customerName}</Text>
        <Text style={styles.orderItems} numberOfLines={2}>
          {order.itemsSummary}
        </Text>
        <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>

        <View style={styles.orderBottom}>
          <Text style={styles.orderMeta}>
            {getPaymentMethodLabel(order.paymentMethod)} - {order.timeAgo}
          </Text>
          <ActionButton
            status={order.status}
            disabled={isUpdating}
            onPress={() => onAdvance(order)}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function OrdersScreen() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const ordersQuery = useQuery({
    queryKey: ownerOrderQueryKeys.all,
    queryFn: fetchOwnerOrders,
    refetchInterval: 5000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: OwnerOrder['id']; status: OwnerOrderStatus }) =>
      updateOwnerOrderStatus(id, status),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData<OwnerOrder[]>(ownerOrderQueryKeys.all, (currentOrders) =>
        currentOrders?.map((order) =>
          String(order.id) === String(updatedOrder.id) ? updatedOrder : order,
        ) ?? [updatedOrder],
      );
      void queryClient.invalidateQueries({ queryKey: ownerOrderQueryKeys.all });
    },
    onError: (error) => {
      Alert.alert(
        'Unable to update order',
        error instanceof Error ? error.message : 'Please try again.',
      );
    },
  });

  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data]);
  const pendingCount = orders.filter((order) => order.status === 'Pending').length;

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (activeFilter !== 'All') {
      result = result.filter((order) => order.status === activeFilter);
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(query) ||
          order.customerName.toLowerCase().includes(query) ||
          order.itemsSummary.toLowerCase().includes(query),
      );
    }

    return result;
  }, [activeFilter, orders, searchQuery]);

  const handleAdvanceOrder = (order: OwnerOrder) => {
    const nextStatus = getNextOrderStatus(order.status);

    if (!nextStatus) {
      return;
    }

    updateStatusMutation.mutate({ id: order.id, status: nextStatus });
  };

  const refreshing = ordersQuery.isRefetching && !ordersQuery.isLoading;
  const activeUpdatingOrderId = updateStatusMutation.variables?.id;
  const hasInitialError = ordersQuery.isError && orders.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
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

        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={styles.searchWrap}>
          <MaterialCommunityIcons name="magnify" size={18} color="#AAA" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders, customer, items..."
            placeholderTextColor="#AAA"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              tintColor="#AC1D10"
              onRefresh={() => {
                void ordersQuery.refetch();
              }}
            />
          }>
          <Animated.View entering={FadeInDown.delay(150).duration(400)}>
            <Text style={styles.pageTitle}>Order Management</Text>
            <Text style={styles.pageSubtitle}>
              Manage incoming orders, track their status, and ensure timely
              fulfillment.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}>
              {FILTERS.map((filter) => {
                const isActive = activeFilter === filter.key;
                const showBadge = filter.key === 'Pending' && pendingCount > 0;

                return (
                  <Pressable
                    key={filter.key}
                    onPress={() => setActiveFilter(filter.key)}
                    style={[
                      styles.filterTab,
                      isActive && styles.filterTabActive,
                    ]}>
                    <Text
                      style={[
                        styles.filterText,
                        isActive && styles.filterTextActive,
                      ]}>
                      {filter.label}
                    </Text>
                    {showBadge && (
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
                          {pendingCount}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>

          {ordersQuery.isLoading ? (
            <View style={styles.stateContainer}>
              <ActivityIndicator size="large" color="#AC1D10" />
              <Text style={styles.stateText}>Fetching your orders...</Text>
            </View>
          ) : hasInitialError ? (
            <View style={styles.stateContainer}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={48}
                color="#CCC"
              />
              <Text style={styles.emptyTitle}>Unable to load orders</Text>
              <Text style={styles.emptySubtitle}>
                {ordersQuery.error instanceof Error
                  ? ordersQuery.error.message
                  : 'Please check your connection and try again.'}
              </Text>
              <Pressable
                onPress={() => {
                  void ordersQuery.refetch();
                }}
                style={({ pressed }) => [
                  styles.retryBtn,
                  pressed && styles.pressed,
                ]}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order, index) => (
              <OrderCard
                key={order.id}
                order={order}
                index={index}
                isUpdating={
                  updateStatusMutation.isPending &&
                  String(activeUpdatingOrderId) === String(order.id)
                }
                onAdvance={handleAdvanceOrder}
              />
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

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F8F8' },
  container: { flex: 1 },
  pressed: { opacity: 0.7 },

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

  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 16,
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
    gap: 12,
    marginBottom: 2,
  },
  orderNumber: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  orderCustomer: { fontSize: 12, color: '#888', marginBottom: 6 },
  orderItems: { fontSize: 13, color: '#555', marginBottom: 4, lineHeight: 18 },
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
    gap: 12,
  },
  orderMeta: { flex: 1, fontSize: 11, color: '#AAA' },

  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    gap: 10,
  },
  stateText: { fontSize: 13, color: '#888', fontWeight: '600' },
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
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#BBB',
    textAlign: 'center',
    lineHeight: 18,
  },
  retryBtn: {
    marginTop: 6,
    borderRadius: 10,
    backgroundColor: '#AC1D10',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
});

const badgeStyles = StyleSheet.create({
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  text: { fontSize: 10, fontWeight: '700' },
});

const actionStyles = StyleSheet.create({
  btn: {
    minWidth: 72,
    minHeight: 30,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontSize: 12, fontWeight: '700' },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.7 },
});
