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

import { NEXT_PAYOUT_MOCK, PAYOUT_HISTORY, PAYOUT_STATS } from '@/constants/mock-payouts-data';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function StatusBadge({ status }: { status: string }) {
  const cfg = {
    Completed: { bg: '#ECFDF5', text: '#059669' },
    Pending: { bg: '#FFF7ED', text: '#EA580C' },
  }[status] ?? { bg: '#F0F0F0', text: '#666' };

  return (
    <View style={[badgeStyles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[badgeStyles.text, { color: cfg.text }]}>{status}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 4, alignSelf: 'flex-start' },
  text: { fontSize: 9, fontWeight: '700' },
});

export default function PayoutsScreen() {
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
              <Text style={styles.pageTitle}>Payouts</Text>
              <Text style={styles.pageSubtitle}>Manage your restaurant's earnings.</Text>
            </Animated.View>

            {/* 2x2 Simple Stat Cards */}
            <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Available Balance</Text>
                <Text style={styles.statValue}>{PAYOUT_STATS.availableBalance}</Text>
                <Text style={styles.statSub}>{PAYOUT_STATS.availableSub}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Pending Balance</Text>
                <Text style={styles.statValue}>{PAYOUT_STATS.pendingBalance}</Text>
                <Text style={styles.statSub}>{PAYOUT_STATS.pendingSub}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total Paid Out</Text>
                <Text style={styles.statValue}>{PAYOUT_STATS.totalPaidOut}</Text>
                <Text style={styles.statSub}>{PAYOUT_STATS.totalPaidSub}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Payout Frequency</Text>
                <Text style={styles.statValue}>{PAYOUT_STATS.payoutFrequency}</Text>
                <Text style={styles.statSub}>{PAYOUT_STATS.payoutFreqSub}</Text>
              </View>
            </Animated.View>

            {/* Next Payout Wide Card */}
            <Animated.View entering={FadeInDown.delay(300).duration(400)} style={[styles.card, styles.nextPayoutCard]}>
              <View style={styles.nextDateRow}>
                <View style={styles.iconWrap}>
                  <MaterialCommunityIcons name="bank-transfer" size={16} color="#AC1D10" />
                </View>
                <View>
                  <Text style={styles.nextLabelText}>Next Payout</Text>
                  <Text style={styles.nextDateText}>{NEXT_PAYOUT_MOCK.date}</Text>
                </View>
              </View>

              <View style={styles.nextAmountRow}>
                <Text style={styles.nextValueText}>{NEXT_PAYOUT_MOCK.amount}</Text>
                <Text style={styles.nextSubText}>Estimated</Text>
              </View>

              <View style={styles.progressWrap}>
                <View style={styles.progressTextRow}>
                  <Text style={styles.progressLabel}>Payout Cycle Progress</Text>
                  <Text style={styles.progressValue}>{NEXT_PAYOUT_MOCK.progress}% Complete</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${NEXT_PAYOUT_MOCK.progress}%` }]} />
                </View>
                <Text style={styles.progressSub}>12 transactions included in final cycle</Text>
              </View>

              <View style={styles.breakdownWrap}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Gross Sales</Text>
                  <Text style={styles.breakdownVal}>₱{NEXT_PAYOUT_MOCK.grossSales.toFixed(2)}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>{NEXT_PAYOUT_MOCK.commissionLabel}</Text>
                  <Text style={styles.breakdownValRed}>
                    -₱{Math.abs(NEXT_PAYOUT_MOCK.commissionValue).toFixed(2)}
                  </Text>
                </View>
                <View style={[styles.breakdownRow, styles.breakdownTotal]}>
                  <Text style={styles.breakdownLabelTotal}>Net Earnings</Text>
                  <Text style={styles.breakdownValTotal}>₱{NEXT_PAYOUT_MOCK.netEarnings.toFixed(2)}</Text>
                </View>
              </View>

              <Pressable
                style={styles.viewDetailsBtn}
                onPress={() => router.push('/payouts/pay-details-1')}>
                <Text style={styles.viewDetailsText}>View Details</Text>
              </Pressable>
            </Animated.View>

            {/* Payout History Section */}
            <Animated.View entering={FadeInLeft.delay(400).duration(400)} style={{ marginBottom: 16 }}>
              <Text style={styles.sectionTitle}>Payout History</Text>
            </Animated.View>

            {PAYOUT_HISTORY.map((item, i) => (
              <AnimatedPressable
                key={item.id}
                entering={FadeInDown.delay(500 + i * 100).duration(450)}
                style={styles.card}
                onPress={() => router.push(`/payouts/pay-details-1`)}>
                <View style={styles.historyRow}>
                  <View style={styles.historyCol}>
                    <Text style={styles.historyLabel}>Reference ID</Text>
                    <Text style={styles.historyValueBold}>{item.refId}</Text>
                  </View>
                  <View style={[styles.historyCol, { alignItems: 'flex-end' }]}>
                    <Text style={styles.historyLabel}>Date Paid</Text>
                    <Text style={styles.historyValueBold}>{item.datePaid}</Text>
                  </View>
                </View>

                <View style={[styles.historyRow, { marginTop: 16 }]}>
                  <View style={styles.historyCol}>
                    <Text style={styles.historyLabel}>Amount</Text>
                    <Text style={styles.historyValueBold}>₱{item.amount.toFixed(2)}</Text>
                  </View>
                  <View style={[styles.historyCol, { alignItems: 'flex-end' }]}>
                    <Text style={styles.historyLabel}>Method</Text>
                    <Text style={styles.historyValueBold}>{item.method}</Text>
                  </View>
                </View>

                <View style={[styles.historyRow, { marginTop: 16, alignItems: 'center' }]}>
                  <View style={styles.historyCol}>
                    <StatusBadge status={item.status} />
                  </View>
                  <View style={[styles.historyCol, { alignItems: 'flex-end' }]}>
                    <View style={styles.docIconBtn}>
                      <MaterialCommunityIcons name="file-document-outline" size={16} color="#777" />
                    </View>
                  </View>
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

  pageTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
  pageSubtitle: { fontSize: 12, color: '#777', lineHeight: 18, marginBottom: 20 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 12,
    padding: 14,
  },
  statLabel: { fontSize: 10, color: '#AAA', marginBottom: 4 },
  statValue: { fontSize: 15, fontWeight: '800', color: '#1A1A1A', marginBottom: 2 },
  statSub: { fontSize: 9, color: '#888' },

  card: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  nextPayoutCard: {
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  nextDateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FBE7E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextLabelText: { fontSize: 10, color: '#888' },
  nextDateText: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },

  nextAmountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 20, gap: 8 },
  nextValueText: { fontSize: 24, fontWeight: '800', color: '#1A1A1A' },
  nextSubText: { fontSize: 11, color: '#888' },

  progressWrap: { marginBottom: 20 },
  progressTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 11, color: '#1A1A1A', fontWeight: '500' },
  progressValue: { fontSize: 11, color: '#AC1D10', fontWeight: '700' },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: '#F0F0F0', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 2, backgroundColor: '#AC1D10' },
  progressSub: { fontSize: 10, color: '#999' },

  breakdownWrap: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
    marginBottom: 20,
  },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  breakdownLabel: { fontSize: 11, color: '#666' },
  breakdownVal: { fontSize: 11, fontWeight: '600', color: '#1A1A1A' },
  breakdownValRed: { fontSize: 11, fontWeight: '600', color: '#AC1D10' },
  breakdownTotal: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#EDEDED' },
  breakdownLabelTotal: { fontSize: 12, fontWeight: '700', color: '#1A1A1A' },
  breakdownValTotal: { fontSize: 12, fontWeight: '700', color: '#1A1A1A' },

  viewDetailsBtn: {
    backgroundColor: '#952011',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  viewDetailsText: { fontSize: 13, fontWeight: '600', color: '#FFF' },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },

  historyRow: { flexDirection: 'row', justifyContent: 'space-between' },
  historyCol: { flex: 1 },
  historyLabel: { fontSize: 10, color: '#AAA', marginBottom: 4 },
  historyValueBold: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },

  docIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
