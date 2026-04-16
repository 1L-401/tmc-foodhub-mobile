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

import { PAYOUT_DETAILS_MOCK } from '@/constants/mock-payouts-data';

export default function PayoutDetailsScreen() {
  const data = PAYOUT_DETAILS_MOCK;
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

  const renderStatusIcon = (state: string) => {
    if (state === 'completed') {
      return (
        <View style={[statusStyles.iconWrap, { backgroundColor: '#059669' }]}>
          <MaterialCommunityIcons name="check" size={12} color="#FFF" />
        </View>
      );
    }
    if (state === 'active') {
      return (
        <View style={[statusStyles.iconWrap, { backgroundColor: '#059669' }]}>
          <MaterialCommunityIcons name="refresh" size={12} color="#FFF" />
        </View>
      );
    }
    return (
      <View style={[statusStyles.iconWrap, { backgroundColor: '#F0F0F0' }]}>
        <MaterialCommunityIcons name="circle-medium" size={12} color="#AAA" />
      </View>
    );
  };

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
              <Text style={styles.pageTitle}>Payout Details</Text>
              <Text style={styles.pageSubtitle}>
                ID: {data.payoutId} • {data.dateTime}
              </Text>
            </Animated.View>

            {/* Action Button */}
            <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ marginBottom: 20 }}>
              <Pressable style={styles.btnPrimary}>
                <MaterialCommunityIcons name="download-outline" size={14} color="#FFF" />
                <Text style={styles.btnPrimaryText}>Download Report</Text>
              </Pressable>
            </Animated.View>

            {/* Top 3 Horizontal Stats */}
            <Animated.View entering={FadeInDown.delay(250).duration(400)} style={statsStyles.row}>
              <View style={statsStyles.card}>
                <Text style={statsStyles.label}>Total Orders</Text>
                <Text style={statsStyles.valueText}>{data.totalOrders}</Text>
                <Text style={statsStyles.subText}>Gross Revenue{'\n'}₱{data.grossRevenue.toFixed(2)}</Text>
              </View>
              <View style={statsStyles.card}>
                <Text style={statsStyles.label}>Total Commission</Text>
                <Text style={[statsStyles.valueText, { fontSize: 13 }]}>-₱{Math.abs(data.totalCommission).toFixed(2)}</Text>
                <Text style={statsStyles.subText}>Calculated at 15% fixed rate</Text>
              </View>
              <View style={statsStyles.card}>
                <Text style={statsStyles.label}>Final Net Payout</Text>
                <Text style={[statsStyles.valueText, { fontSize: 13 }]}>₱{data.finalNetPayout.toFixed(2)}</Text>
                <Text style={statsStyles.subText}>Ready for disbursement</Text>
              </View>
            </Animated.View>

            {/* Transactions Included */}
            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Transactions Included</Text>
                <View style={styles.pillWrap}>
                  <Text style={styles.pillText}>{data.totalOrders} Orders</Text>
                </View>
              </View>

              {data.transactions.map((tx, idx) => (
                <View key={tx.id} style={txListStyles.card}>
                  <View style={txListStyles.rowSpace}>
                    <View>
                      <Text style={txListStyles.label}>Order ID</Text>
                      <Text style={txListStyles.valueBold}>{tx.orderId}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={txListStyles.label}>Order Total</Text>
                      <Text style={txListStyles.valueBold}>₱{tx.orderTotal.toFixed(2)}</Text>
                    </View>
                  </View>
                  <View style={[txListStyles.rowSpace, { marginTop: 12 }]}>
                    <View>
                      <Text style={txListStyles.label}>Commission (15%)</Text>
                      <Text style={txListStyles.valueRed}>-₱{Math.abs(tx.commission).toFixed(2)}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={txListStyles.label}>Net Earnings</Text>
                      <Text style={txListStyles.valueBold}>₱{tx.netEarnings.toFixed(2)}</Text>
                    </View>
                  </View>
                </View>
              ))}

              <Pressable style={txListStyles.viewAllBtn}>
                <Text style={txListStyles.viewAllText}>View All {data.totalOrders} transactions</Text>
              </Pressable>
            </Animated.View>

            {/* Payout Summary */}
            <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.summaryCard}>
              <Text style={styles.cardSectionTitle}>Payout Summary</Text>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryBoxLabel}>Total Net Amount</Text>
                <Text style={styles.summaryBoxValue}>₱{data.totalNetAmount.toFixed(2)}</Text>
              </View>

              <View style={styles.summaryIconRow}>
                <View style={styles.iconWrap}>
                  <MaterialCommunityIcons name="bank" size={16} color="#AC1D10" />
                </View>
                <View>
                  <Text style={styles.summaryIconLabel}>Payout Method</Text>
                  <Text style={styles.summaryIconValue}>{data.payoutMethodStr}</Text>
                </View>
              </View>

              <View style={styles.summaryIconRow}>
                <View style={[styles.iconWrap, { backgroundColor: '#FFF4EE' }]}>
                  <MaterialCommunityIcons name="calendar-blank-outline" size={16} color="#AC1D10" />
                </View>
                <View>
                  <Text style={styles.summaryIconLabel}>Initiated On</Text>
                  <Text style={styles.summaryIconValue}>{data.initiatedOnStr}</Text>
                </View>
              </View>
            </Animated.View>

            {/* Transfer Timeline */}
            <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.summaryCard}>
              <Text style={styles.cardSectionTitle}>Transfer Timeline</Text>

              <View style={statusStyles.timeline}>
                {data.timeline.map((step, idx) => (
                  <View key={step.id} style={statusStyles.stepRow}>
                    <View style={statusStyles.iconCol}>
                      {renderStatusIcon(step.state)}
                      {idx !== data.timeline.length - 1 && (
                        <View
                          style={[
                            statusStyles.line,
                            (step.state === 'completed' || step.state === 'active') &&
                              statusStyles.lineActive,
                          ]}
                        />
                      )}
                    </View>
                    <View style={statusStyles.textCol}>
                      <Text
                        style={[
                          statusStyles.stepLabel,
                          step.state === 'upcoming' && statusStyles.stepLabelInactive,
                        ]}>
                        {step.label}
                      </Text>
                      <Text style={statusStyles.stepTime}>{step.time}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>

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

  pageTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
  pageSubtitle: { fontSize: 11, color: '#777', lineHeight: 18, marginBottom: 16 },

  btnPrimary: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#952011',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  btnPrimaryText: { fontSize: 11, fontWeight: '600', color: '#FFF' },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#1A1A1A' },
  pillWrap: { backgroundColor: '#F0F0F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  pillText: { fontSize: 9, fontWeight: '600', color: '#666' },

  summaryCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  cardSectionTitle: { fontSize: 14, fontWeight: '800', color: '#1A1A1A', marginBottom: 16 },
  summaryBox: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  summaryBoxLabel: { fontSize: 11, color: '#666', marginBottom: 6 },
  summaryBoxValue: { fontSize: 24, fontWeight: '800', color: '#1A1A1A' },

  summaryIconRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FBE7E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIconLabel: { fontSize: 10, color: '#AAA', marginBottom: 2 },
  summaryIconValue: { fontSize: 12, fontWeight: '600', color: '#1A1A1A' },
});

const statsStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  card: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 12,
    padding: 10,
  },
  label: { fontSize: 8, color: '#AAA', marginBottom: 4 },
  valueText: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
  subText: { fontSize: 8, color: '#888', lineHeight: 12 },
});

const txListStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  rowSpace: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 10, color: '#AAA', marginBottom: 4 },
  valueBold: { fontSize: 12, fontWeight: '700', color: '#1A1A1A' },
  valueRed: { fontSize: 12, fontWeight: '700', color: '#AC1D10' },
  viewAllBtn: {
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FBE7E4',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  viewAllText: { fontSize: 12, fontWeight: '700', color: '#AC1D10' },
});

const statusStyles = StyleSheet.create({
  timeline: { paddingVertical: 4 },
  stepRow: { flexDirection: 'row', minHeight: 50 },
  iconCol: { alignItems: 'center', width: 20 },
  iconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  line: { width: 2, flex: 1, backgroundColor: '#F0F0F0', marginVertical: 2 },
  lineActive: { backgroundColor: '#059669' },
  textCol: { flex: 1, paddingLeft: 12, paddingTop: 0 },
  stepLabel: { fontSize: 12, fontWeight: '700', color: '#1A1A1A' },
  stepLabelInactive: { color: '#AAA' },
  stepTime: { fontSize: 10, color: '#888', marginTop: 2 },
});
