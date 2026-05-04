import { useQuery } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import {
  Image,
  Pressable,
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

import { fetchOwnerOrders, ownerOrderQueryKeys } from '@/services/orderService';
import { fetchOwnerProfile } from '@/services/ownerProfileService';
import { fetchInventoryItems, inventoryQueryKeys } from '@/services/inventoryService';import { resolveApiMediaUrl } from '@/src/api/apiConfig';
import {
  RECENT_REVIEWS,
  SALES_DATA,
} from '@/constants/mock-dashboard-data';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/* ─── Simple Bar Chart ─── */
function MiniBarChart({ data = SALES_DATA }: { data?: { label: string; value: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  return (
    <View style={chartStyles.container}>
      <View style={chartStyles.bars}>
        {data.map((d, i) => {
          const pct = (d.value / maxVal) * 100;
          return (
            <Animated.View
              key={d.label}
              entering={FadeInDown.delay(400 + i * 80).duration(500)}
              style={chartStyles.barCol}>
              <View style={chartStyles.barTrack}>
                <Animated.View
                  style={[
                    chartStyles.barFill,
                    { height: `${pct}%` },
                    i === data.length - 1 && chartStyles.barHighlight,
                  ]}
                />
              </View>
              <Text style={chartStyles.barLabel}>{d.label}</Text>
            </Animated.View>
          );
        })}
      </View>
      {/* Y labels */}
      <View style={chartStyles.yLabels}>
        <Text style={chartStyles.yText}>₱{Math.round(maxVal)}</Text>
        <Text style={chartStyles.yText}>₱{Math.round(maxVal / 2)}</Text>
        <Text style={chartStyles.yText}>₱0</Text>
      </View>
    </View>
  );
}

/* ─── Star Rating ─── */
function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <MaterialCommunityIcons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={14}
          color={i <= rating ? '#F59E0B' : '#D0D0D0'}
        />
      ))}
    </View>
  );
}

/* ─── Order Status Badge ─── */
function StatusBadge({ status }: { status: string }) {
  const cfg = {
    new: { bg: '#FEF3C7', text: '#B45309', label: 'New' },
    preparing: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Preparing' },
    ready: { bg: '#D1FAE5', text: '#047857', label: 'Ready' },
  }[status] ?? { bg: '#F0F0F0', text: '#666', label: status };

  return (
    <View style={[badgeStyles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[badgeStyles.text, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

function ActionButton({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  const cfg = {
    new: { bg: '#AC1D10', text: '#FFF', label: 'Accept' },
    preparing: { bg: '#1D4ED8', text: '#FFF', label: 'Ready' },
    ready: { bg: '#E5E7EB', text: '#374151', label: 'Mark done' },
  }[status] ?? { bg: '#E5E7EB', text: '#666', label };

  return (
    <Pressable
      style={({ pressed }) => [
        actionStyles.btn,
        { backgroundColor: cfg.bg },
        pressed && actionStyles.pressed,
      ]}>
      <Text style={[actionStyles.text, { color: cfg.text }]}>
        {cfg.label}
      </Text>
    </Pressable>
  );
}

/* ─── Main Dashboard ─── */
export default function DashboardScreen() {
  const headerScale = useSharedValue(0.95);
  const headerOpacity = useSharedValue(0);

  const { data: profile } = useQuery({
    queryKey: ['owner', 'profile'],
    queryFn: () => fetchOwnerProfile(),
  });

  const { data: orders = [], isLoading: isOrdersLoading } = useQuery({
    queryKey: ownerOrderQueryKeys.all,
    queryFn: fetchOwnerOrders,
    refetchInterval: 1000 * 30, // Fallback polling before WebSockets
  });

  const { data: inventoryItems = [], isLoading: isInventoryLoading } = useQuery({
    queryKey: inventoryQueryKeys.items,
    queryFn: fetchInventoryItems,
  });

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todaysOrders = orders.filter(o => new Date(o.placedAt).toDateString() === today);
    const activeOrders = orders.filter(o => ['Pending', 'Order Confirmed', 'Out for Delivery'].includes(o.status));

    return {
      todaysOrders: todaysOrders.length,
      todaysOrdersGrowth: 'Live data',
      activeOrders: activeOrders.length,
      activeOrdersGrowth: 'Live data'
    };
  }, [orders]);

  const recentOrders = useMemo(() => {
    return orders.slice(0, 3);
  }, [orders]);

  const popularMenu = useMemo(() => {
    return [...inventoryItems]
      .sort((a, b) => (a.stock_level ?? 0) - (b.stock_level ?? 0))
      .slice(0, 3);
  }, [inventoryItems]);

  const salesData = useMemo(() => {
    if (!orders || orders.length === 0) return undefined; // Fallback array handling handled in Component

    const result: { label: string; value: number; dateString: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      result.push({ label, value: 0, dateString: d.toDateString() });
    }

    orders.forEach((o) => {
      if (['Delivered', 'Out for Delivery', 'Order Confirmed'].includes(o.status)) {
        const orderDate = new Date(o.placedAt).toDateString();
        const bucket = result.find((r) => r.dateString === orderDate);
        if (bucket) {
          bucket.value += o.total;
        }
      }
    });

    return result.map(({ label, value }) => ({ label, value }));
  }, [orders]);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerScale.value = withDelay(100, withSpring(1, { damping: 12 }));
  }, []);

  const headerAnim = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ scale: headerScale.value }],
  }));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {/* ── Top Bar ── */}
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

        {/* ── Search ── */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={styles.searchWrap}>
          <MaterialCommunityIcons name="magnify" size={18} color="#AAA" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search anything..."
            placeholderTextColor="#AAA"
          />
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* ── Welcome ── */}
          <Animated.View entering={FadeInDown.delay(250).duration(450)}>
            <Text style={styles.dashboardTitle}>Dashboard</Text>
            <Text style={styles.welcomeText}>
              Welcome back{profile?.name ? `, ${profile.name}` : ''}
            </Text>
          </Animated.View>

          {/* ── Stats Cards ── */}
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
              <Text style={styles.statLabel}>Today's Orders</Text>
              <Text style={styles.statValue}>{stats.todaysOrders}</Text>
              <Text style={styles.statGrowth}>
                📈 {stats.todaysOrdersGrowth}
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <MaterialCommunityIcons
                  name="lightning-bolt-outline"
                  size={18}
                  color="#059669"
                />
              </View>
              <Text style={styles.statLabel}>Active Orders</Text>
              <Text style={styles.statValue}>{stats.activeOrders}</Text>
              <Text style={[styles.statGrowth, { color: '#059669' }]}>
                📈 {stats.activeOrdersGrowth}
              </Text>
            </View>
          </Animated.View>

          {/* ── Recent Orders ── */}
          <Animated.View entering={FadeInDown.delay(450).duration(450)}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
              <Pressable
                onPress={() => router.push('/order-details' as any)}>
                <Text style={styles.viewAll}>View All Orders</Text>
              </Pressable>
            </View>

            {recentOrders.map((order, i) => (
              <AnimatedPressable
                key={order.id}
                entering={FadeInRight.delay(500 + i * 100).duration(400)}
                style={styles.orderCard}
                onPress={() =>
                  router.push({
                    pathname: '/order-details',
                    params: { id: order.id },
                  })
                }>
                <View style={styles.orderTop}>
                  <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                  <StatusBadge status={order.status.toLowerCase()} />
                </View>
                <Text style={styles.orderCustomer}>{order.customerName}</Text>
                <Text style={styles.orderItems}>{order.itemsSummary || 'No items'}</Text>
                <Text style={styles.orderTotal}>
                  ₱{order.total.toFixed(2)}
                </Text>
                <View style={styles.orderBottom}>
                  <Text style={styles.orderMeta}>
                    {order.paymentMethod.toUpperCase()} • {order.timeAgo}
                  </Text>
                  <ActionButton label="" status={order.status.toLowerCase().replace(' ', '_')} />
                </View>
              </AnimatedPressable>
            ))}
            {recentOrders.length === 0 && !isOrdersLoading && (
               <Text style={{textAlign: 'center', color: '#999', marginTop: 10}}>No recent orders.</Text>
            )}
          </Animated.View>

          {/* ── Popular Menu ── */}
          <Animated.View entering={FadeInDown.delay(700).duration(450)}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Popular Menu</Text>
              <Pressable onPress={() => router.push('/(tabs)/menu')}>
                <Text style={styles.viewAll}>View All</Text>
              </Pressable>
            </View>

            {popularMenu.map((item) => (
              <View key={item.id} style={styles.menuRow}>
                <Image
                  source={{ uri: resolveApiMediaUrl(item.image) || 'https://ui-avatars.com/api/?name=No+Img&background=F4F4F4&color=1A1A1A&size=80' }}
                  style={styles.menuImage}
                />
                <View style={styles.menuInfo}>
                  <Text style={styles.menuName}>{item.title}</Text>
                  <Text style={styles.menuOrders}>
                    Stock: {item.stock_level}
                  </Text>
                </View>
                <Text style={styles.menuPrice}>
                  ₱{Number(item.price).toFixed(2)}
                </Text>
              </View>
            ))}
            {popularMenu.length === 0 && !isInventoryLoading && (
               <Text style={{textAlign: 'center', color: '#999', marginTop: 10}}>No menu items available.</Text>
            )}
          </Animated.View>

          {/* ── Sales Revenue ── */}
          <Animated.View entering={FadeInDown.delay(850).duration(450)}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Sales Revenue</Text>
              <Pressable style={styles.periodPill}>
                <Text style={styles.periodText}>Last 7 days</Text>
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={16}
                  color="#888"
                />
              </Pressable>
            </View>

            <View style={styles.chartCard}>
              <MiniBarChart data={salesData} />
            </View>
          </Animated.View>

          {/* ── Recent Reviews ── */}
          <Animated.View entering={FadeInDown.delay(1000).duration(450)}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Recent Reviews</Text>
              <Pressable>
                <Text style={styles.viewAll}>View All</Text>
              </Pressable>
            </View>

            {RECENT_REVIEWS.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  <Image
                    source={{ uri: review.avatar }}
                    style={styles.reviewAvatar}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewName}>{review.name}</Text>
                  </View>
                  <StarRating rating={review.rating} />
                </View>
                <Text style={styles.reviewText}>{review.review}</Text>
              </View>
            ))}
          </Animated.View>

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

  /* Welcome */
  dashboardTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  welcomeText: { fontSize: 13, color: '#888', marginTop: 2, marginBottom: 14 },

  /* Stats */
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
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
  statLabel: { fontSize: 11, color: '#999', fontWeight: '500', marginBottom: 2 },
  statValue: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
  statGrowth: { fontSize: 10, color: '#AC1D10', fontWeight: '500' },

  /* Section */
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  viewAll: { fontSize: 13, fontWeight: '600', color: '#AC1D10' },

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
  orderTotal: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
  orderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderMeta: { fontSize: 11, color: '#AAA' },

  /* Menu Row */
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
  menuInfo: { flex: 1 },
  menuName: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  menuOrders: { fontSize: 11, color: '#999', marginTop: 1 },
  menuPrice: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },

  /* Chart */
  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  periodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  periodText: { fontSize: 11, color: '#888' },

  /* Review */
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
  reviewName: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  reviewText: { fontSize: 13, color: '#555', lineHeight: 19 },
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
    width: 32,
    alignItems: 'flex-end',
  },
  yText: { fontSize: 9, color: '#CCC' },
});
