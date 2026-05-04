import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import {
  fetchInventoryItems,
  inventoryQueryKeys,
  type InventoryMenuItem,
} from '@/services/inventoryService';
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
import {
  fetchOwnerReviews,
  ownerReviewQueryKeys,
  type OwnerReview,
} from '@/services/ownerReviewService';
import type { OwnerUser } from '@/services/authService';
import { resolveApiMediaUrl } from '@/src/api/apiConfig';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type SalesChartPoint = {
  key: string;
  label: string;
  revenue: number;
  orders: number;
};

type PopularMenuItem = {
  id: string;
  name: string;
  ordersThisWeek: number;
  price: number;
  image: string | null;
};

const ACTIVE_ORDER_STATUSES: OwnerOrderStatus[] = [
  'Pending',
  'Order Confirmed',
  'Out for Delivery',
];

const formatCurrency = (amount: number) =>
  `PHP ${Number(amount || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatCompactCurrency = (amount: number) => {
  const value = Number(amount || 0);

  if (value >= 1000) {
    const compact = value / 1000;
    return `PHP ${compact >= 10 ? compact.toFixed(0) : compact.toFixed(1)}k`;
  }

  return `PHP ${value.toFixed(0)}`;
};

const toDateKey = (dateLike: string | Date) => {
  const date = new Date(dateLike);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const recentDays = (count: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (count - 1 - index));
    return date;
  });
};

const sortOrdersByNewest = (orders: OwnerOrder[]) =>
  [...orders].sort((left, right) => {
    const leftTime = new Date(left.placedAt).getTime();
    const rightTime = new Date(right.placedAt).getTime();
    return (Number.isFinite(rightTime) ? rightTime : 0) - (Number.isFinite(leftTime) ? leftTime : 0);
  });

const toTrimmedString = (value: unknown) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const getRestaurantName = (user: OwnerUser | null) =>
  toTrimmedString(user?.restaurant_name) ??
  toTrimmedString(user?.restaurantName) ??
  toTrimmedString(user?.name) ??
  'your restaurant';

function MiniBarChart({ data }: { data: SalesChartPoint[] }) {
  const maxVal = Math.max(...data.map((point) => point.revenue), 0);
  const yLabels = [
    formatCompactCurrency(maxVal),
    formatCompactCurrency(maxVal * 0.5),
    formatCompactCurrency(0),
  ];

  return (
    <View style={chartStyles.container}>
      <View style={chartStyles.bars}>
        {data.map((point, index) => {
          const pct =
            maxVal > 0
              ? Math.max((point.revenue / maxVal) * 100, point.revenue > 0 ? 8 : 0)
              : 0;

          return (
            <Animated.View
              key={point.key}
              entering={FadeInDown.delay(400 + index * 80).duration(500)}
              style={chartStyles.barCol}>
              <View style={chartStyles.barTrack}>
                <Animated.View
                  style={[
                    chartStyles.barFill,
                    { height: `${pct}%` },
                    index === data.length - 1 && chartStyles.barHighlight,
                  ]}
                />
              </View>
              <Text style={chartStyles.barLabel}>{point.label}</Text>
            </Animated.View>
          );
        })}
      </View>
      <View style={chartStyles.yLabels}>
        {yLabels.map((label) => (
          <Text key={label} style={chartStyles.yText}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

function StarRating({ rating }: { rating: number }) {
  const resolvedRating = Math.round(Number(rating) || 0);

  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <MaterialCommunityIcons
          key={i}
          name={i <= resolvedRating ? 'star' : 'star-outline'}
          size={14}
          color={i <= resolvedRating ? '#F59E0B' : '#D0D0D0'}
        />
      ))}
    </View>
  );
}

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

function EmptyCard({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.emptyCard}>
      <MaterialCommunityIcons name={icon} size={32} color="#CCC" />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );
}

function ReviewAvatar({ review }: { review: OwnerReview }) {
  if (review.avatar) {
    return <Image source={{ uri: review.avatar }} style={styles.reviewAvatar} />;
  }

  return (
    <View style={styles.reviewInitials}>
      <Text style={styles.reviewInitialsText}>{review.customerInitials}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const headerScale = useSharedValue(0.95);
  const headerOpacity = useSharedValue(0);

  const ordersQuery = useQuery({
    queryKey: ownerOrderQueryKeys.all,
    queryFn: fetchOwnerOrders,
    refetchInterval: 5000,
  });

  const inventoryQuery = useQuery({
    queryKey: inventoryQueryKeys.items,
    queryFn: fetchInventoryItems,
  });

  const reviewsQuery = useQuery({
    queryKey: ownerReviewQueryKeys.all,
    queryFn: fetchOwnerReviews,
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

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerScale.value = withDelay(100, withSpring(1, { damping: 12 }));
  }, [headerOpacity, headerScale]);

  const headerAnim = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ scale: headerScale.value }],
  }));

  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data]);
  const inventoryItems = useMemo(() => inventoryQuery.data ?? [], [inventoryQuery.data]);
  const recentReviews = useMemo(
    () => reviewsQuery.data?.reviews.slice(0, 3) ?? [],
    [reviewsQuery.data?.reviews],
  );
  const todayKey = toDateKey(new Date());
  const restaurantName = getRestaurantName(user);

  const sortedOrders = useMemo(() => sortOrdersByNewest(orders), [orders]);
  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return sortedOrders;
    }

    return sortedOrders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.itemsSummary.toLowerCase().includes(query),
    );
  }, [searchQuery, sortedOrders]);

  const todayOrders = useMemo(
    () => orders.filter((order) => toDateKey(order.placedAt) === todayKey),
    [orders, todayKey],
  );

  const activeOrdersCount = useMemo(
    () => orders.filter((order) => ACTIVE_ORDER_STATUSES.includes(order.status)).length,
    [orders],
  );

  const pendingOrdersCount = useMemo(
    () => orders.filter((order) => order.status === 'Pending').length,
    [orders],
  );

  const todaysRevenue = useMemo(
    () => todayOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0),
    [todayOrders],
  );

  const recentOrders = filteredOrders.slice(0, 5);

  const chartData = useMemo<SalesChartPoint[]>(() => {
    return recentDays(7).map((date) => {
      const dateKey = toDateKey(date);
      const dayOrders = orders.filter((order) => toDateKey(order.placedAt) === dateKey);

      return {
        key: dateKey,
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dayOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0),
        orders: dayOrders.length,
      };
    });
  }, [orders]);

  const popularItems = useMemo<PopularMenuItem[]>(() => {
    const inventoryLookup = new Map(
      inventoryItems.map((item) => [String(item.id), item] as const),
    );
    const counts = new Map<string, PopularMenuItem & { revenue: number }>();
    const weekKeys = new Set(recentDays(7).map(toDateKey));

    orders.forEach((order) => {
      if (!weekKeys.has(toDateKey(order.placedAt))) {
        return;
      }

      order.items.forEach((item) => {
        const key = String(item.menuItemId ?? item.name);
        const inventoryItem: InventoryMenuItem | undefined = item.menuItemId
          ? inventoryLookup.get(String(item.menuItemId))
          : undefined;
        const quantity = Number(item.quantity || item.qty || 0);
        const price = Number(inventoryItem?.price ?? item.price ?? 0);
        const current = counts.get(key) ?? {
          id: key,
          name: inventoryItem?.title || item.name,
          ordersThisWeek: 0,
          price,
          image: resolveApiMediaUrl(inventoryItem?.image ?? item.image),
          revenue: 0,
        };

        current.ordersThisWeek += quantity;
        current.revenue += price * quantity;
        current.price = price;
        current.name = inventoryItem?.title || current.name;
        current.image = resolveApiMediaUrl(inventoryItem?.image ?? current.image);
        counts.set(key, current);
      });
    });

    return Array.from(counts.values())
      .sort((left, right) => right.ordersThisWeek - left.ordersThisWeek || right.revenue - left.revenue)
      .slice(0, 3);
  }, [inventoryItems, orders]);

  const handleAdvanceOrder = (order: OwnerOrder) => {
    const nextStatus = getNextOrderStatus(order.status);

    if (!nextStatus) {
      return;
    }

    updateStatusMutation.mutate({ id: order.id, status: nextStatus });
  };

  const refetchDashboard = () => {
    void Promise.all([
      ordersQuery.refetch(),
      inventoryQuery.refetch(),
      reviewsQuery.refetch(),
    ]);
  };

  const isInitialLoading = ordersQuery.isLoading && orders.length === 0;
  const hasInitialOrdersError = ordersQuery.isError && orders.length === 0;
  const refreshing =
    (ordersQuery.isRefetching || inventoryQuery.isRefetching || reviewsQuery.isRefetching) &&
    !isInitialLoading;
  const activeUpdatingOrderId = updateStatusMutation.variables?.id;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Animated.View style={[styles.topBar, headerAnim]}>
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
          entering={FadeInDown.delay(200).duration(400)}
          style={styles.searchWrap}>
          <MaterialCommunityIcons name="magnify" size={18} color="#AAA" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders, customers, items..."
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
              onRefresh={refetchDashboard}
            />
          }>
          <Animated.View entering={FadeInDown.delay(250).duration(450)}>
            <Text style={styles.dashboardTitle}>Dashboard</Text>
            <Text style={styles.welcomeText}>Welcome back, {restaurantName}</Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(350).duration(450)}
            style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardPrimary]}>
              <View style={styles.statIconWrap}>
                <MaterialCommunityIcons
                  name="cart-outline"
                  size={18}
                  color="#AC1D10"
                />
              </View>
              <Text style={styles.statLabel}>{"Today's Orders"}</Text>
              {isInitialLoading ? (
                <ActivityIndicator size="small" color="#AC1D10" style={styles.statLoader} />
              ) : (
                <Text style={styles.statValue}>{todayOrders.length}</Text>
              )}
              <Text style={styles.statGrowth}>{formatCurrency(todaysRevenue)} today</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconWrap, styles.activeStatIcon]}>
                <MaterialCommunityIcons
                  name="lightning-bolt-outline"
                  size={18}
                  color="#059669"
                />
              </View>
              <Text style={styles.statLabel}>Active Orders</Text>
              {isInitialLoading ? (
                <ActivityIndicator size="small" color="#059669" style={styles.statLoader} />
              ) : (
                <Text style={styles.statValue}>{activeOrdersCount}</Text>
              )}
              <Text style={[styles.statGrowth, { color: '#059669' }]}>
                {pendingOrdersCount} pending
              </Text>
            </View>
          </Animated.View>

          {hasInitialOrdersError ? (
            <View style={styles.stateContainer}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={48}
                color="#CCC"
              />
              <Text style={styles.emptyTitle}>Unable to load dashboard</Text>
              <Text style={styles.emptySubtitle}>
                {ordersQuery.error instanceof Error
                  ? ordersQuery.error.message
                  : 'Please check your connection and try again.'}
              </Text>
              <Pressable
                onPress={refetchDashboard}
                style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Animated.View entering={FadeInDown.delay(450).duration(450)}>
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionTitle}>Recent Orders</Text>
                  <Pressable onPress={() => router.push('/orders')}>
                    <Text style={styles.viewAll}>View All Orders</Text>
                  </Pressable>
                </View>

                {isInitialLoading ? (
                  <View style={styles.stateContainerCompact}>
                    <ActivityIndicator size="small" color="#AC1D10" />
                    <Text style={styles.stateText}>Fetching live orders...</Text>
                  </View>
                ) : recentOrders.length > 0 ? (
                  recentOrders.map((order, index) => (
                    <AnimatedPressable
                      key={order.id}
                      entering={FadeInRight.delay(500 + index * 100).duration(400)}
                      style={styles.orderCard}
                      onPress={() =>
                        router.push({
                          pathname: '/order-details',
                          params: { id: String(order.id) },
                        })
                      }>
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
                        <Text style={styles.orderMeta} numberOfLines={1}>
                          {getPaymentMethodLabel(order.paymentMethod)} - {order.timeAgo}
                        </Text>
                        <ActionButton
                          status={order.status}
                          disabled={
                            updateStatusMutation.isPending &&
                            String(activeUpdatingOrderId) === String(order.id)
                          }
                          onPress={() => handleAdvanceOrder(order)}
                        />
                      </View>
                    </AnimatedPressable>
                  ))
                ) : (
                  <EmptyCard
                    icon="clipboard-text-off-outline"
                    title="No orders yet"
                    subtitle="New customer orders will show here automatically."
                  />
                )}
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(700).duration(450)}>
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionTitle}>Popular Menu</Text>
                  <Pressable onPress={() => router.push('/menu')}>
                    <Text style={styles.viewAll}>View All</Text>
                  </Pressable>
                </View>

                {popularItems.length > 0 ? (
                  popularItems.map((item) => (
                    <View key={item.id} style={styles.menuRow}>
                      {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.menuImage} />
                      ) : (
                        <View style={styles.menuImagePlaceholder}>
                          <MaterialCommunityIcons
                            name="image-outline"
                            size={20}
                            color="#BBB"
                          />
                        </View>
                      )}
                      <View style={styles.menuInfo}>
                        <Text style={styles.menuName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.menuOrders}>
                          {item.ordersThisWeek} sold this week
                        </Text>
                      </View>
                      <Text style={styles.menuPrice}>{formatCurrency(item.price)}</Text>
                    </View>
                  ))
                ) : (
                  <EmptyCard
                    icon={inventoryQuery.isError ? 'wifi-alert' : 'food-off-outline'}
                    title={inventoryQuery.isError ? 'Menu data unavailable' : 'No popular items yet'}
                    subtitle={
                      inventoryQuery.isError
                        ? 'Orders are live, but menu details could not be refreshed.'
                        : 'Once orders come in, your top dishes will appear here.'
                    }
                  />
                )}
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(850).duration(450)}>
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionTitle}>Sales Revenue</Text>
                  <View style={styles.periodPill}>
                    <Text style={styles.periodText}>Last 7 days</Text>
                  </View>
                </View>

                <View style={styles.chartCard}>
                  <Text style={styles.chartTotal}>
                    {formatCurrency(chartData.reduce((sum, day) => sum + day.revenue, 0))}
                  </Text>
                  <MiniBarChart data={chartData} />
                </View>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(1000).duration(450)}>
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionTitle}>Recent Reviews</Text>
                  <Pressable onPress={() => router.push('/reviews')}>
                    <Text style={styles.viewAll}>View All</Text>
                  </Pressable>
                </View>

                {reviewsQuery.isLoading ? (
                  <View style={styles.stateContainerCompact}>
                    <ActivityIndicator size="small" color="#AC1D10" />
                    <Text style={styles.stateText}>Fetching recent feedback...</Text>
                  </View>
                ) : reviewsQuery.isError ? (
                  <EmptyCard
                    icon="message-alert-outline"
                    title="Reviews unavailable"
                    subtitle="Customer feedback could not be refreshed right now."
                  />
                ) : recentReviews.length > 0 ? (
                  recentReviews.map((review) => (
                    <View key={review.id} style={styles.reviewCard}>
                      <View style={styles.reviewTop}>
                        <ReviewAvatar review={review} />
                        <View style={styles.reviewInfo}>
                          <Text style={styles.reviewName} numberOfLines={1}>
                            {review.customerName}
                          </Text>
                          {review.createdAtLabel ? (
                            <Text style={styles.reviewDate} numberOfLines={1}>
                              {review.createdAtLabel}
                            </Text>
                          ) : null}
                        </View>
                        <StarRating rating={review.rating} />
                      </View>
                      {review.orderItems.length > 0 ? (
                        <Text style={styles.reviewItems} numberOfLines={1}>
                          {review.orderItems.slice(0, 3).join(', ')}
                        </Text>
                      ) : null}
                      <Text style={styles.reviewText} numberOfLines={3}>
                        {review.review || 'No written feedback provided.'}
                      </Text>
                    </View>
                  ))
                ) : (
                  <EmptyCard
                    icon="star-off-outline"
                    title="No reviews yet"
                    subtitle={`Customer reviews for ${restaurantName} will appear here.`}
                  />
                )}
              </Animated.View>
            </>
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
  logoTitle: { fontSize: 8, color: '#1A1A1A', fontWeight: '500', lineHeight: 10 },
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

  dashboardTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  welcomeText: { fontSize: 13, color: '#888', marginTop: 2, marginBottom: 14 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    minHeight: 128,
  },
  statCardPrimary: { borderColor: '#FCDCD8' },
  statIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#FBE7E4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  activeStatIcon: { backgroundColor: '#D1FAE5' },
  statLabel: { fontSize: 11, color: '#999', fontWeight: '500', marginBottom: 2 },
  statValue: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
  statGrowth: { fontSize: 10, color: '#AC1D10', fontWeight: '500' },
  statLoader: { alignSelf: 'flex-start', height: 38, marginBottom: 4 },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  viewAll: { fontSize: 13, fontWeight: '600', color: '#AC1D10' },

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
  orderTotal: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
  orderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  orderMeta: { flex: 1, fontSize: 11, color: '#AAA' },

  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 10,
  },
  menuImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F0F0',
  },
  menuImagePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuInfo: { flex: 1 },
  menuName: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  menuOrders: { fontSize: 11, color: '#999', marginTop: 1 },
  menuPrice: {
    maxWidth: 104,
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'right',
  },

  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  chartTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  periodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  periodText: { fontSize: 11, color: '#888' },

  reviewCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0F0F0',
  },
  reviewInitials: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewInitialsText: { fontSize: 11, fontWeight: '800', color: '#6B7280' },
  reviewInfo: { flex: 1 },
  reviewName: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  reviewDate: { fontSize: 10, color: '#AAA', marginTop: 1 },
  reviewItems: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#FEF2F2',
    color: '#B42318',
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  reviewText: { fontSize: 13, color: '#555', lineHeight: 19 },

  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 52,
    gap: 10,
  },
  stateContainerCompact: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingVertical: 24,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 8,
  },
  stateText: { fontSize: 13, color: '#888', fontWeight: '600' },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingVertical: 24,
    paddingHorizontal: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
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

const chartStyles = StyleSheet.create({
  container: { flexDirection: 'row', height: 120 },
  bars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  barCol: { flex: 1, alignItems: 'center' },
  barTrack: {
    width: '70%',
    height: 90,
    justifyContent: 'flex-end',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  barFill: { backgroundColor: '#FCDCD8', borderRadius: 4 },
  barHighlight: { backgroundColor: '#AC1D10' },
  barLabel: { fontSize: 10, color: '#AAA', marginTop: 4 },
  yLabels: {
    justifyContent: 'space-between',
    paddingVertical: 2,
    width: 54,
    alignItems: 'flex-end',
  },
  yText: { fontSize: 9, color: '#CCC', textAlign: 'right' },
});
