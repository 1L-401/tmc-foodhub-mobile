import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  EARNINGS_BALANCES,
  EARNINGS_TRENDS_CHART,
  PAYOUT_HISTORY,
  REVENUE_BREAKDOWN,
  TOP_SELLING_BY_REVENUE,
} from '@/constants/mock-earnings-data';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/* ─── Segmented Control ─── */
function SegmentedControl({ active, onChange }: { active: string; onChange: (v: string) => void }) {
  const options = ['Today', '7 days', '30 days', 'Custom'];
  return (
    <View style={segmentStyles.container}>
      {options.map((opt) => {
        const isActive = active === opt;
        return (
          <Pressable
            key={opt}
            style={[segmentStyles.btn, isActive && segmentStyles.btnActive]}
            onPress={() => onChange(opt)}>
            <Text style={[segmentStyles.text, isActive && segmentStyles.textActive]}>
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ─── Revenue Trends Bar Chart ─── */
function RevenueChart() {
  const maxVal = Math.max(...EARNINGS_TRENDS_CHART.map((d) => d.value));

  return (
    <View style={chartStyles.container}>
      {/* Tooltip (Static positioning for mockup over highest bar) */}
      <View style={chartStyles.tooltipContainer}>
        <View style={chartStyles.tooltip}>
          <Text style={chartStyles.tooltipDate}>Feb 23, 2026</Text>
          <View style={chartStyles.tooltipRow}>
            <Text style={chartStyles.tooltipLabel}>Revenue</Text>
            <Text style={chartStyles.tooltipValue}>₱5,600</Text>
          </View>
          <View style={chartStyles.tooltipRow}>
            <Text style={chartStyles.tooltipLabel}>Orders</Text>
            <Text style={chartStyles.tooltipValue}>42</Text>
          </View>
          <View style={chartStyles.tooltipGrowthPill}>
            <MaterialCommunityIcons name="trending-up" size={10} color="#16A34A" />
            <Text style={chartStyles.tooltipGrowthText}>+12% vs last week</Text>
          </View>
        </View>
        <View style={chartStyles.tooltipTriangle} />
      </View>

      {/* Bars Area */}
      <View style={chartStyles.chartArea}>
        {/* Y Axis labels absolute positioned behind */}
        <View style={chartStyles.yAxisWrap}>
          <Text style={chartStyles.yText}>15k</Text>
          <Text style={chartStyles.yText}>10k</Text>
          <Text style={chartStyles.yText}>5k</Text>
          <Text style={chartStyles.yText}>0</Text>
        </View>

        <View style={chartStyles.bars}>
          {EARNINGS_TRENDS_CHART.map((d, i) => {
            const isHighest = d.value === maxVal;
            const pct = (d.value / maxVal) * 100;
            return (
              <Animated.View
                key={i}
                entering={FadeInDown.delay(400 + i * 50).duration(500)}
                style={chartStyles.barCol}>
                <View style={chartStyles.barTrack}>
                  <View
                    style={[
                      chartStyles.barFill,
                      { height: `${pct}%` },
                      isHighest && chartStyles.barFillActive,
                    ]}
                  />
                </View>
                {/* Simplify x-axis labels */}
                {i === 1 || i === 5 || i === 9 || i === EARNINGS_TRENDS_CHART.length - 1 ? (
                  <Text style={chartStyles.barLabel}>{d.label}</Text>
                ) : (
                  <Text style={chartStyles.barLabel} />
                )}
              </Animated.View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

/* ─── Main Screen ─── */
export default function EarningsScreen() {
  const [activeSegment, setActiveSegment] = useState('Today');
  const headerScale = useSharedValue(0.95);
  const headerOpacity = useSharedValue(0);

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

        {/* Global Search bar */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={styles.searchWrap}>
          <MaterialCommunityIcons name="magnify" size={18} color="#AAA" />
          <Text style={styles.searchText}>Search items...</Text>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Header Title */}
          <Animated.View entering={FadeInLeft.delay(150).duration(400)}>
            <Text style={styles.pageTitle}>Earnings</Text>
            <Text style={styles.pageSubtitle}>
              Track your revenue, payouts, and financial performance over time.
            </Text>
          </Animated.View>

          {/* Segmented Control */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ marginBottom: 20 }}>
            <SegmentedControl active={activeSegment} onChange={setActiveSegment} />
          </Animated.View>

          {/* Balance Cards Horizontal Scroll */}
          <Animated.View entering={FadeInRight.delay(250).duration(450)}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.balancesScroll}
              snapToInterval={172}
              decelerationRate="fast">
              {EARNINGS_BALANCES.map((card, i) => (
                <View key={card.id} style={styles.balanceCard}>
                  <View style={styles.balanceCardHeader}>
                    <View style={styles.balanceIconWrap}>
                      <MaterialCommunityIcons name={card.icon as any} size={14} color="#AC1D10" />
                    </View>
                    <Text style={styles.balanceLabel}>{card.label}</Text>
                  </View>
                  <Text style={styles.balanceValue}>{card.value}</Text>
                  <Text style={styles.balanceGrowth}>{card.growth}</Text>
                </View>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Revenue Breakdown */}
          <Animated.View entering={FadeInDown.delay(350).duration(450)} style={styles.sectionHeaderNoRow}>
            <Text style={styles.sectionTitle}>Revenue Breakdown</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(450)} style={styles.breakdownGrid}>
            {REVENUE_BREAKDOWN.map((item, i) => (
              <View key={item.id} style={styles.breakdownCard}>
                <Text style={styles.breakdownLabel}>{item.label}</Text>
                <Text
                  style={[
                    styles.breakdownValue,
                    item.isNegative && { color: '#AC1D10' },
                    item.isBold && { fontWeight: '800' },
                  ]}>
                  {item.value}
                </Text>
              </View>
            ))}
          </Animated.View>

          {/* Daily Revenue Trends Chart */}
          <Animated.View entering={FadeInDown.delay(500).duration(450)} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Daily Revenue Trends</Text>
              <Pressable style={styles.periodPill}>
                <Text style={styles.periodText}>Last 30 days</Text>
                <MaterialCommunityIcons name="chevron-down" size={14} color="#888" />
              </Pressable>
            </View>

            <RevenueChart />
          </Animated.View>

          {/* Top Selling Items by Revenue */}
          <Animated.View entering={FadeInDown.delay(600).duration(450)} style={styles.sectionCard}>
            <View style={[styles.sectionHeader, { alignItems: 'center' }]}>
              <Text style={styles.sectionTitle}>Top Selling Items by Revenue</Text>
              <Pressable style={styles.periodPillLight}>
                <Text style={styles.periodText}>This Month</Text>
                <MaterialCommunityIcons name="chevron-down" size={14} color="#888" />
              </Pressable>
            </View>

            {TOP_SELLING_BY_REVENUE.map((item, i) => (
              <View key={item.id} style={styles.topItemRow}>
                <Image source={{ uri: item.image }} style={styles.topItemImage} />
                <View style={styles.topItemInfo}>
                  <View style={styles.topItemHead}>
                    <Text style={styles.topItemName}>{item.name}</Text>
                    <Text style={styles.topItemRevenue}>{item.revenue}</Text>
                  </View>
                  <View style={styles.topItemProgressTrack}>
                    <Animated.View
                      entering={FadeInLeft.delay(700 + i * 100).duration(500)}
                      style={[styles.topItemProgressFill, { width: `${item.progress * 100}%` }]}
                    />
                  </View>
                </View>
              </View>
            ))}
          </Animated.View>

          {/* Payout History */}
          <Animated.View entering={FadeInDown.delay(700).duration(450)}>
            <View style={styles.sectionHeaderNoRow}>
              <Text style={styles.sectionTitle}>Payout History</Text>
            </View>

            {PAYOUT_HISTORY.map((payout, i) => (
              <AnimatedPressable
                key={payout.id}
                entering={FadeInDown.delay(800 + i * 100).duration(400)}
                style={styles.payoutCard}>
                <View style={styles.payoutTop}>
                  <View style={styles.payoutCol}>
                    <Text style={styles.payoutLabel}>Reference ID</Text>
                    <Text style={styles.payoutStrong}>{payout.referenceId}</Text>
                  </View>
                  <View style={[styles.payoutCol, { alignItems: 'flex-end' }]}>
                    <Text style={styles.payoutLabel}>Date Paid</Text>
                    <Text style={styles.payoutStrong}>{payout.datePaid}</Text>
                  </View>
                </View>

                <View style={styles.payoutBottom}>
                  <View style={styles.payoutCol}>
                    <Text style={styles.payoutLabel}>Amount</Text>
                    <Text style={[styles.payoutStrong, { fontSize: 16 }]}>
                      ₱{payout.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <View style={[styles.payoutCol, { alignItems: 'flex-end', justifyContent: 'center' }]}>
                    <Text style={styles.payoutLabel}>Method</Text>
                    <Text style={[styles.payoutStrong, { marginBottom: 6 }]}>{payout.method}</Text>
                    <View style={styles.payoutBadge}>
                      <Text style={styles.payoutBadgeText}>{payout.status}</Text>
                    </View>
                  </View>
                </View>
              </AnimatedPressable>
            ))}
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

  /* Horizontal Balances Scroll */
  balancesScroll: {
    gap: 12,
    paddingRight: 16, // trailing space
    marginBottom: 24,
  },
  balanceCard: {
    width: 160,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  balanceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  balanceIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FBE7E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceLabel: { fontSize: 11, color: '#888', fontWeight: '500' },
  balanceValue: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
  balanceGrowth: { fontSize: 9, color: '#888' },

  /* Sections */
  sectionHeaderNoRow: { marginBottom: 12 },
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
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },

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
  periodPillLight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  periodText: { fontSize: 10, color: '#666', fontWeight: '500' },

  /* Breakdown Grid */
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  breakdownCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  breakdownLabel: { fontSize: 12, color: '#888', marginBottom: 6 },
  breakdownValue: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },

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
  topItemRevenue: { fontSize: 12, fontWeight: '700', color: '#AC1D10' },
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

  /* Payout History */
  payoutCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  payoutTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  payoutBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payoutCol: { flex: 1 },
  payoutLabel: { fontSize: 10, color: '#AAA', marginBottom: 4 },
  payoutStrong: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },
  payoutBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  payoutBadgeText: { fontSize: 9, color: '#059669', fontWeight: '700' },
});

const segmentStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FDFDFD',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 8,
    padding: 4,
  },
  btn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  btnActive: {
    backgroundColor: '#AC1D10',
  },
  text: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  textActive: {
    color: '#FFF',
    fontWeight: '600',
  },
});

const chartStyles = StyleSheet.create({
  container: { height: 160, marginTop: 10, position: 'relative' },
  chartArea: { flex: 1, flexDirection: 'row', position: 'relative' },
  yAxisWrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 20,
    justifyContent: 'space-between',
  },
  yText: { fontSize: 10, color: '#CCC' },
  bars: {
    flex: 1,
    marginLeft: 30, // make room for y labels
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barCol: { width: '7%', alignItems: 'center', height: '100%' },
  barTrack: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  barFill: {
    width: '100%',
    backgroundColor: '#ECA094',
    borderRadius: 4,
  },
  barFillActive: {
    backgroundColor: '#AE1B0D',
  },
  barLabel: { fontSize: 8, color: '#AAA', height: 12 },

  tooltipContainer: {
    position: 'absolute',
    top: -20,
    right: '20%',
    zIndex: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tooltip: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    minWidth: 110,
  },
  tooltipDate: { fontSize: 11, fontWeight: '700', color: '#AC1D10', marginBottom: 4 },
  tooltipRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  tooltipLabel: { fontSize: 10, color: '#888' },
  tooltipValue: { fontSize: 10, fontWeight: '700', color: '#1A1A1A' },
  tooltipGrowthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
    gap: 2,
  },
  tooltipGrowthText: { fontSize: 9, color: '#16A34A', fontWeight: '600' },
  tooltipTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFF',
    marginTop: -1, 
  },
});
