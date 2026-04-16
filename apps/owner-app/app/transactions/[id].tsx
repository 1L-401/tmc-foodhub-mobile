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

import { TRANSACTION_DETAILS_MOCK } from '@/constants/mock-transactions-data';

export default function TransactionDetailsScreen() {
  const data = TRANSACTION_DETAILS_MOCK;
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
          <MaterialCommunityIcons name="check" size={14} color="#FFF" />
        </View>
      );
    }
    if (state === 'pending') {
      return (
        <View style={[statusStyles.iconWrap, { backgroundColor: '#D97706' }]}>
          <MaterialCommunityIcons name="clock-time-four-outline" size={14} color="#FFF" />
        </View>
      );
    }
    return (
      <View style={[statusStyles.iconWrap, { backgroundColor: '#F0F0F0' }]}>
        <MaterialCommunityIcons name="circle-medium" size={14} color="#AAA" />
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
              <Text style={styles.pageTitle}>Transaction Details</Text>
              <Text style={styles.pageSubtitle}>
                Order: {data.orderNumber}{'\n'}
                Processed on {data.processDate}
              </Text>
            </Animated.View>

            {/* Action Buttons Row */}
            <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.actionsRow}>
              <Pressable style={styles.btnOutline}>
                <MaterialCommunityIcons name="download-outline" size={16} color="#333" />
                <Text style={styles.btnOutlineText}>Download Invoice</Text>
              </Pressable>
              <Pressable style={styles.btnPrimary}>
                <MaterialCommunityIcons name="printer" size={16} color="#FFF" />
                <Text style={styles.btnPrimaryText}>Print Receipt</Text>
              </Pressable>
            </Animated.View>

            {/* Order Details Card */}
            <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.card}>
              <Text style={styles.cardTitle}>Order Details</Text>

              {/* Customer Info */}
              <View style={detailStyles.section}>
                <Text style={detailStyles.label}>Customer Info</Text>
                <Text style={detailStyles.strongText}>{data.customer.name}</Text>
                <Text style={detailStyles.subText}>{data.customer.email}</Text>
                <Text style={detailStyles.subText}>{data.customer.phone}</Text>
              </View>

              {/* Delivery Address */}
              <View style={detailStyles.section}>
                <Text style={detailStyles.label}>Delivery Address</Text>
                <Text style={detailStyles.strongText}>{data.delivery.address.split('\n')[0]}</Text>
                <Text style={detailStyles.subText}>{data.delivery.address.split('\n')[1]}</Text>

                <View style={detailStyles.mapWrap}>
                  <Image source={{ uri: data.delivery.mapImage }} style={detailStyles.mapImg} />
                  <Pressable style={detailStyles.viewMapBtn}>
                    <Text style={detailStyles.viewMapText}>View on Map</Text>
                  </Pressable>
                </View>
              </View>

              {/* Items */}
              <View style={detailStyles.itemsWrap}>
                {data.items.map((item) => (
                  <View key={item.id} style={detailStyles.itemRow}>
                    <Image source={{ uri: item.image }} style={detailStyles.itemImg} />
                    <View style={detailStyles.itemInfo}>
                      <Text style={detailStyles.itemName}>{item.name}</Text>
                      <Text style={detailStyles.itemQty}>Qty: {item.qty}</Text>
                    </View>
                    <View style={detailStyles.itemPriceCol}>
                      <Text style={detailStyles.label}>Unit Price</Text>
                      <Text style={detailStyles.itemPriceBold}>
                        ₱{item.unitPrice.toFixed(2)}
                      </Text>
                    </View>
                    <View style={[detailStyles.itemPriceCol, { alignItems: 'flex-end', minWidth: 60 }]}>
                      <Text style={detailStyles.label}>Total</Text>
                      <Text style={detailStyles.itemPriceRed}>
                        ₱{item.total.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* Financial Breakdown Card */}
            <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.card}>
              <Text style={styles.cardTitle}>Financial Breakdown</Text>

              <View style={finStyles.row}>
                <Text style={finStyles.label}>Subtotal</Text>
                <Text style={finStyles.value}>₱{data.financials.subtotal.toFixed(2)}</Text>
              </View>
              <View style={finStyles.row}>
                <Text style={finStyles.label}>Delivery Fee</Text>
                <Text style={finStyles.value}>₱{data.financials.deliveryFee.toFixed(2)}</Text>
              </View>
              <View style={finStyles.row}>
                <Text style={finStyles.label}>Platform Commission (15%)</Text>
                <Text style={finStyles.valueRed}>
                  -₱{Math.abs(data.financials.platformCommission).toFixed(2)}
                </Text>
              </View>
              <View style={[finStyles.row, { borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 16, marginBottom: 16 }]}>
                <Text style={finStyles.label}>VAT (12%)</Text>
                <Text style={finStyles.value}>₱{data.financials.vat.toFixed(2)}</Text>
              </View>

              <View style={finStyles.row}>
                <Text style={finStyles.totalLabel}>Net Earnings</Text>
                <Text style={finStyles.totalValue}>₱{data.financials.netEarnings.toFixed(2)}</Text>
              </View>

              <View style={finStyles.infoBox}>
                <MaterialCommunityIcons name="information" size={14} color="#AC1D10" />
                <Text style={finStyles.infoText}>
                  Earnings are calculated based on subtotal plus taxes, minus platform fees. Delivery
                  fees go directly to the courier.
                </Text>
              </View>
            </Animated.View>

            {/* Payout Status Card */}
            <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.card}>
              <Text style={styles.cardTitle}>Payout Status</Text>

              <View style={statusStyles.timeline}>
                {data.payoutStatus.map((step, idx) => (
                  <View key={step.id} style={statusStyles.stepRow}>
                    <View style={statusStyles.iconCol}>
                      {renderStatusIcon(step.state)}
                      {idx !== data.payoutStatus.length - 1 && (
                        <View
                          style={[
                            statusStyles.line,
                            (step.state === 'completed' || step.state === 'pending') &&
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
  pageSubtitle: { fontSize: 12, color: '#777', lineHeight: 18, marginBottom: 20 },

  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  btnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingVertical: 10,
  },
  btnOutlineText: { fontSize: 13, fontWeight: '600', color: '#333' },
  btnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#952011',
    borderRadius: 8,
    paddingVertical: 10,
  },
  btnPrimaryText: { fontSize: 13, fontWeight: '600', color: '#FFF' },

  card: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 16 },
});

const detailStyles = StyleSheet.create({
  section: { marginBottom: 16 },
  label: { fontSize: 11, color: '#AAA', marginBottom: 4 },
  strongText: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
  subText: { fontSize: 12, color: '#666', marginBottom: 2 },
  mapWrap: {
    marginTop: 10,
    height: 120,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  mapImg: { width: '100%', height: '100%' },
  viewMapBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  viewMapText: { fontSize: 11, fontWeight: '700', color: '#1A1A1A' },
  itemsWrap: { marginTop: 16 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  itemImg: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#EEE', marginRight: 10 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 12, fontWeight: '700', color: '#1A1A1A' },
  itemQty: { fontSize: 11, color: '#888', marginTop: 2 },
  itemPriceCol: { alignItems: 'flex-start', justifyContent: 'center' },
  itemPriceBold: { fontSize: 12, fontWeight: '700', color: '#1A1A1A' },
  itemPriceRed: { fontSize: 12, fontWeight: '700', color: '#AC1D10' },
});

const finStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { fontSize: 12, color: '#666' },
  value: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },
  valueRed: { fontSize: 13, fontWeight: '700', color: '#AC1D10' },
  totalLabel: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },
  totalValue: { fontSize: 22, fontWeight: '800', color: '#AC1D10' },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FDF2F2',
    padding: 10,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  infoText: { flex: 1, fontSize: 11, color: '#952011', lineHeight: 16 },
});

const statusStyles = StyleSheet.create({
  timeline: { paddingVertical: 8 },
  stepRow: { flexDirection: 'row', minHeight: 60 },
  iconCol: { alignItems: 'center', width: 30 },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  line: { width: 2, flex: 1, backgroundColor: '#F0F0F0', marginVertical: 4 },
  lineActive: { backgroundColor: '#059669' },
  textCol: { flex: 1, paddingLeft: 10, paddingTop: 2 },
  stepLabel: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },
  stepLabelInactive: { color: '#AAA' },
  stepTime: { fontSize: 11, color: '#888', marginTop: 2 },
});
