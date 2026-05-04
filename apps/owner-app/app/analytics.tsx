import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInLeft,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useQuery } from '@tanstack/react-query';
import { fetchOwnerOrders, ownerOrderQueryKeys, type OwnerOrder } from '@/services/orderService';
import { useAuth } from '@/context/AuthContext';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/* ─── Bar Chart ─── */
function SalesChart({ data = [] }: { data: { label: string; thisPeriod: number; lastPeriod: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.thisPeriod + d.lastPeriod), 1);
  return (
    <View style={chartStyles.container}>
      {/* Y Axis */}
      <View style={chartStyles.yLabels}>
        <Text style={chartStyles.yText}>{(maxVal).toFixed(0)}</Text>
        <Text style={chartStyles.yText}>{(maxVal * 0.75).toFixed(0)}</Text>
        <Text style={chartStyles.yText}>{(maxVal * 0.5).toFixed(0)}</Text>
        <Text style={chartStyles.yText}>{(maxVal * 0.25).toFixed(0)}</Text>
        <Text style={chartStyles.yText}>0</Text>
      </View>

      <View style={chartStyles.bars}>
        {data.map((d, i) => {
          const totalPct = ((d.thisPeriod + d.lastPeriod) / maxVal) * 100;
          const thisPeriodPct = d.thisPeriod + d.lastPeriod > 0 ? (d.thisPeriod / (d.thisPeriod + d.lastPeriod)) * 100 : 0;
          const lastPeriodPct = 100 - thisPeriodPct;

          return (
            <Animated.View
              key={d.label}
              entering={FadeInDown.delay(300 + i * 80).duration(500)}
              style={chartStyles.barCol}>
              <View style={chartStyles.barTrackWrap}>
                <View style={[chartStyles.barTrack, { height: `${totalPct}%` }]}>
                  <View style={[chartStyles.barFillLight, { height: `${lastPeriodPct}%` }]} />
                  <View style={[chartStyles.barFillDark, { height: `${thisPeriodPct}%` }]} />
                </View>
              </View>
              <Text style={chartStyles.barLabel}>{d.label}</Text>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

/* ─── Heatmap ─── */
const HEATMAP_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HEATMAP_HOURS = ['10a', '12p', '2p', '4p', '6p', '8p', '10p'];

function OrderPatternsHeatmap({ heatmapData = [] }: { heatmapData: number[][] }) {
  const getColor = (val: number) => {
    switch (val) {
      case 1: return '#FFF4EE';
      case 2: return '#F5D3C8';
      case 3: return '#E07A5F';
      case 4: return '#B02613';
      case 5: return '#7A130A';
      default: return '#FFF4EE';
    }
  };

  return (
    <View style={heatmapStyles.container}>
      {/* Hours X Axis */}
      <View style={heatmapStyles.hoursRow}>
        <View style={heatmapStyles.dayLabelSpace} />
        {HEATMAP_HOURS.map((h, i) => (
          <Text key={i} style={heatmapStyles.hourLabel}>
            {h}
          </Text>
        ))}
      </View>

      {/* Grid */}
      {HEATMAP_DAYS.map((day, rIndex) => (
        <View key={day} style={heatmapStyles.gridRow}>
          <Text style={heatmapStyles.dayLabel}>{day}</Text>
          {heatmapData[rIndex]?.map((val, cIndex) => (
            <Animated.View
              key={`${day}-${cIndex}`}
              entering={FadeInDown.delay(400 + (rIndex * 7 + cIndex) * 10).duration(400)}
              style={[heatmapStyles.cell, { backgroundColor: getColor(val) }]}
            />
          ))}
        </View>
      ))}

      {/* Legend */}
      <View style={heatmapStyles.legendRow}>
        <Text style={heatmapStyles.legendText}>Low</Text>
        {[1, 2, 3, 4, 5].map((val) => (
          <View key={val} style={[heatmapStyles.legendCell, { backgroundColor: getColor(val) }]} />
        ))}
        <Text style={heatmapStyles.legendText}>High</Text>
      </View>
    </View>
  );
}

/* ─── Value Order Badge ─── */
function StatusBadge({ status }: { status: string }) {
  const cfg = {
    'In progress': { bg: '#FEF3C7', text: '#B45309' },
    Pending: { bg: '#FFF7ED', text: '#EA580C' },
    Delivered: { bg: '#D1FAE5', text: '#047857' },
  }[status] ?? { bg: '#F0F0F0', text: '#666' };

  return (
    <View style={[badgeStyles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[badgeStyles.text, { color: cfg.text }]}>{status}</Text>
    </View>
  );
}

/* ─── Main Screen ─── */
export default function AnalyticsScreen() {
  const headerScale = useSharedValue(0.95);
  const headerOpacity = useSharedValue(0);

  const { data: orders = [] } = useQuery({
    queryKey: ownerOrderQueryKeys.all,
    queryFn: fetchOwnerOrders,
  });

  const totalRevenue = orders.filter(o => ['Delivered', 'Out for Delivery', 'Order Confirmed'].includes(o.status)).reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00';

  const analyticsStats = [
    { id: 1, label: 'Total Revenue', value: `₱${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, growth: '+Live', isPositive: true, comparison: 'Current period' },
    { id: 2, label: 'Total Orders', value: String(totalOrders), growth: '+Live', isPositive: true, comparison: 'Current period' },
    { id: 3, label: 'Store Views', value: '1,240', growth: '+12%', isPositive: true, comparison: 'vs last week' },
    { id: 4, label: 'Avg Order Value', value: `₱${avgOrderValue}`, growth: 'Live', isPositive: true, comparison: 'Current period' },
  ];

  const salesChartData = React.useMemo(() => {
    const result: { label: string; thisPeriod: number; lastPeriod: number; dateString: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      result.push({ label, thisPeriod: 0, lastPeriod: 0, dateString: d.toDateString() });
    }
    orders.forEach((o) => {
      if (['Delivered', 'Out for Delivery', 'Order Confirmed'].includes(o.status)) {
        const orderDate = new Date(o.placedAt).toDateString();
        const bucket = result.find((r) => r.dateString === orderDate);
        if (bucket) {
          bucket.thisPeriod += o.total;
        }
      }
    });
    return result;
  }, [orders]);

  const heatmapData = React.useMemo(() => {
    const matrix = Array(7).fill(0).map(() => Array(7).fill(1));
    orders.forEach(o => {
       const date = new Date(o.placedAt);
       let day = date.getDay() - 1; // 0 is Mon, 6 is Sun
       if (day < 0) day = 6;
       const hour = date.getHours();
       let colIndex = 0;
       if (hour >= 10 && hour < 12) colIndex = 0;
       else if (hour >= 12 && hour < 14) colIndex = 1;
       else if (hour >= 14 && hour < 16) colIndex = 2;
       else if (hour >= 16 && hour < 18) colIndex = 3;
       else if (hour >= 18 && hour < 20) colIndex = 4;
       else if (hour >= 20 && hour < 22) colIndex = 5;
       else if (hour >= 22) colIndex = 6;
       
       if (day >= 0 && day <= 6 && colIndex >= 0 && colIndex <= 6) {
           matrix[day][colIndex] = Math.min(matrix[day][colIndex] + 1, 5);
       }
    });
    return matrix;
  }, [orders]);

  const highValueOrders = React.useMemo(() => {
    return [...orders].sort((a, b) => b.total - a.total).slice(0, 5);
  }, [orders]);

  const topSellingItems = React.useMemo(() => {
    const itemsMap: Record<string, {name: string; orders: number; image: string | null}> = {};
    orders.forEach(o => {
       o.items.forEach(item => {
           if (!itemsMap[item.name]) {
               itemsMap[item.name] = { name: item.name, orders: 0, image: item.image };
           }
           itemsMap[item.name].orders += item.quantity;
       });
    });
    const sorted = Object.values(itemsMap).sort((a, b) => b.orders - a.orders).slice(0, 4);
    const maxOrders = Math.max(...sorted.map(s => s.orders), 1);
    return sorted.map((s, i) => ({
       id: i,
       name: s.name,
       orders: s.orders,
       image: s.image || 'https://ui-avatars.com/api/?name=Item&background=F4F4F4&color=1A1A1A',
       progress: s.orders / maxOrders,
    }));
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
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Top Header Row with Logo */}
        <Animated.View style={[styles.topNavRow, headerAnim]}>
          <Pressable
            style={({ pressed }) => [styles.menuBtn, pressed && styles.pressed]}
            onPress={() => router.back()}>
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

          <View style={styles.topNavRight}>
            <Pressable style={styles.bellWrap}>
              <MaterialCommunityIcons name="bell-outline" size={20} color="#1A1A1A" />
              <View style={styles.bellBadge} />
            </Pressable>
          </View>
        </Animated.View>

        {/* Global Search bar (optional if strictly matching img, img has a search here) */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={styles.searchWrap}>
          <MaterialCommunityIcons name="magnify" size={18} color="#AAA" />
          <Text style={styles.searchText}>Search items...</Text>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Header Title */}
          <Animated.View entering={FadeInLeft.delay(150).duration(400)}>
            <Text style={styles.pageTitle}>Analytics</Text>
            <Text style={styles.pageSubtitle}>
              Analyze sales trends, customer behavior, and order patterns to make informed decisions.
            </Text>
          </Animated.View>

          {/* Filters Row */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.filterRow}>
            <Pressable style={styles.filterPill}>
              <MaterialCommunityIcons name="calendar-blank-outline" size={14} color="#555" />
              <Text style={styles.filterText}>Feb 01, 2026 - Mar 05, 2026</Text>
            </Pressable>

            <Pressable style={styles.filterPill}>
              <Text style={styles.filterText}>All Categories</Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color="#888" />
            </Pressable>

            <Pressable style={styles.exportBtn}>
              <MaterialCommunityIcons name="download-outline" size={14} color="#FFF" />
              <Text style={styles.exportText}>Export</Text>
            </Pressable>
          </Animated.View>

          {/* Stat Cards 2x2 Grid */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.statsGrid}>
            {analyticsStats.map((stat, i) => (
              <View key={stat.id} style={styles.statCard}>
                <View style={cardStyles.header}>
                  <Text style={cardStyles.label}>{stat.label}</Text>
                  <View
                    style={[
                      cardStyles.growthPill,
                      { backgroundColor: stat.isPositive ? '#E6F4EA' : '#FCE8E8' },
                    ]}>
                    <MaterialCommunityIcons
                      name={stat.isPositive ? 'trending-up' : 'trending-down'}
                      size={12}
                      color={stat.isPositive ? '#16A34A' : '#DC2626'}
                    />
                    <Text
                      style={[
                        cardStyles.growthText,
                        { color: stat.isPositive ? '#16A34A' : '#DC2626' },
                      ]}>
                      {stat.growth}
                    </Text>
                  </View>
                </View>
                <Text style={cardStyles.value}>{stat.value}</Text>
                <Text style={cardStyles.comparison}>{stat.comparison}</Text>
              </View>
            ))}
          </Animated.View>

          {/* Sales / Revenue Chart */}
          <Animated.View entering={FadeInDown.delay(400).duration(450)} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Sales/Revenue</Text>
                <Text style={styles.sectionLargeValue}>₱{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>

              <View style={styles.chartHeaderRight}>
                <View style={styles.legendWrap}>
                  <View style={[styles.legendDot, { backgroundColor: '#AC1D10' }]} />
                  <Text style={styles.legendText}>This Period</Text>
                  <View style={[styles.legendDot, { backgroundColor: '#F5D3C8', marginLeft: 8 }]} />
                  <Text style={styles.legendText}>Last Period</Text>
                </View>
                <Pressable style={styles.periodPill}>
                  <Text style={styles.periodText}>Last 7 days</Text>
                  <MaterialCommunityIcons name="chevron-down" size={14} color="#888" />
                </Pressable>
              </View>
            </View>

            <SalesChart data={salesChartData} />
          </Animated.View>

          {/* Top Selling Items */}
          <Animated.View entering={FadeInDown.delay(500).duration(450)} style={styles.sectionCard}>
            <View style={[styles.sectionHeader, { alignItems: 'center' }]}>
              <Text style={styles.sectionTitle}>Top Selling Items</Text>
              <Pressable>
                <Text style={styles.viewAll}>View All</Text>
              </Pressable>
            </View>

            {topSellingItems.length > 0 ? topSellingItems.map((item, i) => (
              <View key={item.id} style={styles.topItemRow}>
                <Image source={{ uri: item.image }} style={styles.topItemImage} />
                <View style={styles.topItemInfo}>
                  <View style={styles.topItemHead}>
                    <Text style={styles.topItemName}>{item.name}</Text>
                    <Text style={styles.topItemOrders}>{item.orders} orders</Text>
                  </View>
                  <View style={styles.topItemProgressTrack}>
                    <Animated.View
                      entering={FadeInLeft.delay(600 + i * 100).duration(500)}
                      style={[styles.topItemProgressFill, { width: `${item.progress * 100}%` }]}
                    />
                  </View>
                </View>
              </View>
            )) : <Text style={{ color: '#888', textAlign: 'center' }}>No items sold yet.</Text>}
          </Animated.View>

          {/* Order Patterns Heatmap */}
          <Animated.View entering={FadeInDown.delay(600).duration(450)} style={styles.sectionCard}>
            <View style={styles.sectionHeaderNoRow}>
              <Text style={styles.sectionTitle}>Order Patterns</Text>
              <Text style={styles.chartSubTitle}>Peak hours vs. day of week</Text>
            </View>
            <OrderPatternsHeatmap heatmapData={heatmapData} />
          </Animated.View>

          {/* Recent High Value Orders */}
          <Animated.View entering={FadeInDown.delay(700).duration(450)} style={styles.sectionCard}>
            <View style={[styles.sectionHeader, { alignItems: 'center' }]}>
              <Text style={styles.sectionTitle}>Recent High Value Orders</Text>
              <Pressable>
                <Text style={styles.viewAll}>View All</Text>
              </Pressable>
            </View>

            <View style={styles.tableHeader}>
              <Text style={[styles.tableCol, { flex: 0.8 }]}>Order ID</Text>
              <Text style={[styles.tableCol, { flex: 1.5 }]}>Customer</Text>
              <Text style={[styles.tableCol, { flex: 0.8 }]}>Total</Text>
              <Text style={[styles.tableCol, { flex: 0.8 }]}>Status</Text>
            </View>

            {highValueOrders.length > 0 ? highValueOrders.map((order, i) => (
              <AnimatedPressable
                key={order.id}
                entering={FadeInDown.delay(800 + i * 100).duration(400)}
                style={styles.tableRow}
                onPress={() =>
                  router.push({
                    pathname: '/order-details',
                    params: { id: order.id },
                  })
                }>
                <Text style={[styles.tableCell, styles.tableCellBold, { flex: 0.8 }]}>
                  {order.orderNumber}
                </Text>
                <View style={[styles.tableCustomerWrap, { flex: 1.5 }]}>
                  <View style={styles.tableAvatar} />
                  <Text style={styles.tableCell} numberOfLines={1}>{order.customerName}</Text>
                </View>
                <Text style={[styles.tableCell, styles.tableCellBold, { flex: 0.8 }]}>
                  ₱{order.total.toFixed(2)}
                </Text>
                <View style={{ flex: 0.8, alignItems: 'flex-start' }}>
                  <StatusBadge status={order.status} />
                </View>
              </AnimatedPressable>
            )) : <Text style={{ color: '#888', textAlign: 'center', marginTop: 10 }}>No orders yet.</Text>}
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  pressed: { opacity: 0.7 },

  /* Navigation / Logo */
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  menuBtn: { padding: 4 },
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
  topNavRight: { flexDirection: 'row', alignItems: 'center' },
  bellWrap: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  bellBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#AC1D10',
  },

  /* Global Search */
  searchWrap: {
    marginHorizontal: 16,
    marginBottom: 20,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FDFDFD',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  searchText: { fontSize: 14, color: '#AAA' },

  scroll: { paddingHorizontal: 16 },

  pageTitle: { fontSize: 24, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
  pageSubtitle: { fontSize: 13, color: '#777', lineHeight: 20, marginBottom: 20, paddingRight: 20 },

  /* Filter */
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDFDFD',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  filterText: { fontSize: 12, color: '#444', fontWeight: '500' },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#952011',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    marginLeft: 'auto',
  },
  exportText: { fontSize: 12, color: '#FFF', fontWeight: '600' },

  /* Stats Grid */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },

  /* Sections */
  sectionCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionHeaderNoRow: { marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  sectionLargeValue: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', marginTop: 4 },
  viewAll: { fontSize: 13, fontWeight: '700', color: '#AC1D10' },
  chartSubTitle: { fontSize: 11, color: '#888', marginTop: 4 },

  chartHeaderRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  legendWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  legendDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  legendText: { fontSize: 9, color: '#777', fontWeight: '500' },

  periodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  periodText: { fontSize: 10, color: '#666', fontWeight: '500' },

  /* Top Items List */
  topItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  topItemImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginRight: 12,
  },
  topItemInfo: { flex: 1 },
  topItemHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  topItemName: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  topItemOrders: { fontSize: 12, fontWeight: '700', color: '#AC1D10' },
  topItemProgressTrack: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  topItemProgressFill: {
    height: '100%',
    backgroundColor: '#AC1D10',
    borderRadius: 3,
  },

  /* Order List */
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 8,
  },
  tableCol: { fontSize: 11, color: '#999', fontWeight: '500' },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9F9F9',
  },
  tableCell: { fontSize: 12, color: '#333' },
  tableCellBold: { fontWeight: '700', color: '#1A1A1A' },
  tableCustomerWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tableAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#EEE' },
});

const cardStyles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { fontSize: 12, color: '#888', fontWeight: '500' },
  growthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  growthText: { fontSize: 10, fontWeight: '700' },
  value: { fontSize: 24, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
  comparison: { fontSize: 11, color: '#999' },
});

const chartStyles = StyleSheet.create({
  container: { flexDirection: 'row', height: 160, marginTop: 10 },
  yLabels: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: 24,
    paddingBottom: 20, // space for x labels
    paddingTop: 8,
    marginRight: 12,
  },
  yText: { fontSize: 10, color: '#999' },
  bars: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barCol: { width: 28, alignItems: 'center' },
  barTrackWrap: { height: 140, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  barTrack: {
    width: 16,
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFillLight: { width: '100%', backgroundColor: '#F5D3C8' },
  barFillDark: { width: '100%', backgroundColor: '#AE1B0D' },
  barLabel: { fontSize: 9, color: '#AAA', marginTop: 8 },
});

const heatmapStyles = StyleSheet.create({
  container: { marginTop: 10, paddingRight: 4 },
  hoursRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'center',
  },
  dayLabelSpace: { width: 34 },
  hourLabel: { flex: 1, textAlign: 'center', fontSize: 10, color: '#999' },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayLabel: { width: 34, fontSize: 11, color: '#666', fontWeight: '500' },
  cell: {
    flex: 1,
    aspectRatio: 1.8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 14,
    gap: 4,
  },
  legendText: { fontSize: 10, color: '#888', marginHorizontal: 4 },
  legendCell: { width: 12, height: 12, borderRadius: 2 },
});

const badgeStyles = StyleSheet.create({
  badge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 4 },
  text: { fontSize: 9, fontWeight: '700' },
});
