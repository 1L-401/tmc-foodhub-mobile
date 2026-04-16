import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import {
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

import {
  RECENT_TRANSACTIONS,
  TRANSACTIONS_STATS,
} from '@/constants/mock-transactions-data';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: string }) {
  const cfg = {
    'Paid Out': { bg: '#ECFDF5', text: '#059669' },
    Pending: { bg: '#FFF7ED', text: '#EA580C' },
    Refunded: { bg: '#FEF2F2', text: '#DC2626' },
  }[status] ?? { bg: '#F0F0F0', text: '#666' };

  return (
    <View style={[badgeStyles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[badgeStyles.text, { color: cfg.text }]}>{status}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 4 },
  text: { fontSize: 9, fontWeight: '700' },
});

export default function TransactionsScreen() {
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
              <Text style={styles.pageTitle}>Transactions</Text>
              <Text style={styles.pageSubtitle}>
                Track your revenue, payouts, and financial performance over time.
              </Text>
            </Animated.View>

            {/* Stats Cards 2x2 Grid */}
            <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.statsGrid}>
              {TRANSACTIONS_STATS.map((stat, i) => (
                <View key={stat.id} style={styles.statCard}>
                  <View style={cardStyles.header}>
                    <View style={cardStyles.headerLeft}>
                      <View style={cardStyles.iconWrap}>
                        <MaterialCommunityIcons name={stat.icon as any} size={14} color="#AC1D10" />
                      </View>
                    </View>
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
                  <Text style={cardStyles.label}>{stat.label}</Text>
                  <Text style={cardStyles.value}>{stat.value}</Text>
                </View>
              ))}
            </Animated.View>

            {/* Filters Row */}
            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <View style={styles.filterRowItems}>
                <Pressable style={styles.filterPill}>
                  <MaterialCommunityIcons name="calendar-blank-outline" size={14} color="#555" />
                  <Text style={styles.filterText}>Today, Mar 5</Text>
                </Pressable>

                <Pressable style={styles.filterPill}>
                  <Text style={styles.filterText}>All Payment Methods</Text>
                  <MaterialCommunityIcons name="chevron-down" size={16} color="#888" />
                </Pressable>

                <Pressable style={styles.filterPill}>
                  <Text style={styles.filterText}>Status: All</Text>
                  <MaterialCommunityIcons name="chevron-down" size={16} color="#888" />
                </Pressable>
              </View>

              <Pressable style={styles.exportBtn}>
                <MaterialCommunityIcons name="download-outline" size={14} color="#FFF" />
                <Text style={styles.exportText}>Export</Text>
              </Pressable>
            </Animated.View>

            <View style={{ height: 16 }} />

            {/* Transaction List */}
            {RECENT_TRANSACTIONS.map((tx, i) => (
              <AnimatedPressable
                key={tx.id}
                entering={FadeInDown.delay(400 + i * 100).duration(450)}
                style={txStyles.card}
                onPress={() => router.push(`/transactions/${tx.id}`)}>
                {/* Row 1: Order ID and Customer */}
                <View style={txStyles.rowSpace}>
                  <View>
                    <Text style={txStyles.label}>Order ID</Text>
                    <Text style={txStyles.valueBold}>{tx.orderId}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={txStyles.label}>Customer</Text>
                    <Text style={txStyles.valueBold}>{tx.customerName}</Text>
                    <Text style={txStyles.subtext}>{tx.customerEmail}</Text>
                  </View>
                </View>

                {/* Row 2: Items, Total, Net */}
                <View style={[txStyles.rowSpace, { marginTop: 16 }]}>
                  <View style={{ flex: 1.2 }}>
                    <Text style={txStyles.label}>Items</Text>
                    <Text style={[txStyles.valueBold, { fontSize: 13, lineHeight: 18 }]}>
                      {tx.itemsSummary}
                    </Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={txStyles.label}>Total</Text>
                    <Text style={txStyles.valueBold}>₱{tx.total.toFixed(2)}</Text>
                    <Text style={[txStyles.subtext, { marginTop: 4 }]}>Comm: ₱{tx.commission.toFixed(2)}</Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={txStyles.label}>Net</Text>
                    <Text style={txStyles.valueRed}>₱{tx.net.toFixed(2)}</Text>
                  </View>
                </View>

                {/* Row 3: Date, Method, Status */}
                <View style={[txStyles.rowSpace, { marginTop: 16, alignItems: 'center' }]}>
                  <View style={{ flex: 1.2 }}>
                    <Text style={txStyles.label}>Date</Text>
                    <Text style={txStyles.valueBold}>{tx.dateStr}</Text>
                    <Text style={txStyles.subtext}>{tx.timeStr}</Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={txStyles.label}>Method</Text>
                    <Text style={txStyles.valueBold}>{tx.method}</Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={txStyles.label}>Status</Text>
                    <StatusBadge status={tx.status} />
                  </View>
                </View>

                {/* Action Icon Bottom Right */}
                <View style={txStyles.actionRow}>
                  <Pressable style={txStyles.actionBtn}>
                    <MaterialCommunityIcons name="eye-outline" size={14} color="#777" />
                  </Pressable>
                </View>
              </AnimatedPressable>
            ))}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1 },
  pressed: { opacity: 0.7 },

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
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },

  filterRowItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
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
  filterText: { fontSize: 11, color: '#444', fontWeight: '500' },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#952011',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    alignSelf: 'flex-start',
  },
  exportText: { fontSize: 12, color: '#FFF', fontWeight: '600' },
});

const cardStyles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#FBE7E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 11, color: '#888', fontWeight: '500', marginBottom: 6 },
  growthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  growthText: { fontSize: 10, fontWeight: '700' },
  value: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
});

const txStyles = StyleSheet.create({
  card: {
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
  rowSpace: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 10, color: '#AAA', marginBottom: 4 },
  valueBold: { fontSize: 13, fontWeight: '800', color: '#1A1A1A' },
  valueRed: { fontSize: 13, fontWeight: '800', color: '#AC1D10' },
  subtext: { fontSize: 10, color: '#888', marginTop: 2 },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
