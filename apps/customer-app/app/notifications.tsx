import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiClient } from '@/src/api/apiClient';
import { applyLocalOrderStatuses } from '@/src/features/orders/local-order-status';
import { isOngoingStatus, normalizeOrderStatus } from '@/src/features/orders/order-status';

/* ─── Mock Data ──────────────────────────────────────────────────────────── */
const FILTERS = ['All', 'Orders', 'Offers', 'News & Blogs'];

const RECENT_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'order',
    icon: 'moped',
    iconBg: '#FFF3ED',
    iconColor: '#D9531E',
    title: 'Order Out for Delivery',
    time: '2m ago',
    description: 'Your feast from Patty Shack is on its way with our top-rated rider, Ricardo.',
    embeddedDetails: {
      image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=150&q=80',
      title: 'Grilled Steak + Black Iced Coffee',
      eta: 'Estimated arrival: 12:45 PM',
    },
  },
  {
    id: 'n2',
    type: 'offer',
    icon: 'party-popper',
    iconBg: '#F0F4FF',
    iconColor: '#3B68FF',
    title: "Chef's Secret Discount",
    time: '1h ago',
    description: 'Enjoy 30% off on all Italian delicacies this weekend. Use code PASTALOVE.',
  },
];

const EARLIER_NOTIFICATIONS = [
  {
    id: 'n3',
    type: 'recommendation',
    icon: 'silverware-fork-knife',
    iconBg: '#FFF5EB',
    iconColor: '#D97D19',
    title: 'Curated for You',
    time: 'Yesterday',
    description: "Based on your love for Spicy Ramen, we think you'll adore Kyoto Noodle Bar's new menu.",
  },
  {
    id: 'n4',
    type: 'rating',
    icon: 'star',
    iconBg: '#FFF9E6',
    iconColor: '#F5A623',
    title: 'How was your meal?',
    time: 'Yesterday',
    description: "Your feedback helps us curate the best experiences. Rate your order from Mama's Kitchen.",
    showStars: true,
  },
];

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function NotificationsScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [ongoingOrder, setOngoingOrder] = useState<any>(null);

  const fetchOngoingOrder = useCallback(async () => {
    try {
      const response = await apiClient<any[]>('/orders');
      const mergedOrders = applyLocalOrderStatuses(response || []);
      setOngoingOrder(mergedOrders.find((order) => isOngoingStatus(order.status)) ?? null);
    } catch (error) {
      console.error('Failed to load notifications order tracker:', error);
    }
  }, []);

  useEffect(() => {
    fetchOngoingOrder();
  }, [fetchOngoingOrder]);

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)');
  };

  const ongoingStatusText = (() => {
    const normalizedStatus = normalizeOrderStatus(ongoingOrder?.status);

    if (normalizedStatus === 'pending') return 'Waiting for restaurant confirmation';
    if (normalizedStatus === 'order confirmed') return 'Restaurant confirmed your order';
    if (normalizedStatus === 'preparing') return 'Your food is being prepared';
    if (normalizedStatus === 'out for delivery') return 'Your rider is on the way';
    return ongoingOrder?.status ?? '';
  })();

  const renderCard = (item: any) => {
    return (
      <View key={item.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
            <MaterialCommunityIcons name={item.icon as any} size={20} color={item.iconColor} />
          </View>
          <View style={styles.headerTexts}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardTime}>{item.time}</Text>
          </View>
        </View>

        <Text style={styles.cardDescription}>
          {item.description}
        </Text>

        {/* Embedded Order Tracker (Optional) */}
        {item.embeddedDetails && (
          <View style={styles.embeddedCard}>
            <Image source={{ uri: item.embeddedDetails.image }} style={styles.embeddedImage} />
            <View style={styles.embeddedTexts}>
              <Text style={styles.embeddedTitle}>{item.embeddedDetails.title}</Text>
              <Text style={styles.embeddedEta}>{item.embeddedDetails.eta}</Text>
            </View>
          </View>
        )}

        {/* Embedded Stars (Optional) */}
        {item.showStars && (
          <View style={styles.starsWrap}>
            {[1, 2, 3, 4, 5].map((star) => (
              <MaterialCommunityIcons key={star} name="star" size={24} color="#E0E0E0" style={{ marginRight: 6 }} />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Utility Header (for back navigation on Android/iOS pushed screen) */}
      <View style={styles.topBar}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          onPress={handleBackPress}>
          <MaterialCommunityIcons name="chevron-left" size={26} color="#1A1A1A" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Main Title */}
        <Text style={styles.pageTitle}>Notifications</Text>

        {ongoingOrder ? (
          <Pressable
            style={({ pressed }) => [styles.liveOrderCard, pressed && styles.pressed]}
            onPress={() =>
              router.push({
                pathname: '/order-tracking/[id]',
                params: { id: ongoingOrder.id },
              })
            }>
            <View style={styles.liveOrderIconWrap}>
              <MaterialCommunityIcons name="motorbike" size={18} color="#FFFFFF" />
            </View>
            <View style={styles.liveOrderCopyWrap}>
              <Text style={styles.liveOrderTitle} numberOfLines={1}>
                {ongoingOrder.store_name || `Order #${ongoingOrder.id}`}
              </Text>
              <Text style={styles.liveOrderSubtitle} numberOfLines={1}>
                {ongoingStatusText}
              </Text>
            </View>
            <View style={styles.liveOrderAction}>
              <Text style={styles.liveOrderActionText}>Track</Text>
            </View>
          </Pressable>
        ) : null}

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        >
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <Pressable
                key={filter}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Recent Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent</Text>
          {RECENT_NOTIFICATIONS.map(renderCard)}
        </View>

        {/* Earlier Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earlier</Text>
          {EARLIER_NOTIFICATIONS.map(renderCard)}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 16,
  },
  liveOrderCard: {
    marginHorizontal: 20,
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: '#AC1D10',
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveOrderIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveOrderCopyWrap: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  liveOrderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  liveOrderSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: 'rgba(255,255,255,0.82)',
  },
  liveOrderAction: {
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveOrderActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#AC1D10',
  },
  filterList: {
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    backgroundColor: '#AC1D10',
    borderColor: '#AC1D10',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTexts: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  cardTime: {
    fontSize: 12,
    color: '#AAAAAA',
    marginLeft: 8,
  },
  cardDescription: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  embeddedCard: {
    flexDirection: 'row',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    alignItems: 'center',
  },
  embeddedImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginRight: 12,
  },
  embeddedTexts: {
    flex: 1,
    justifyContent: 'center',
  },
  embeddedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  embeddedEta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D9531E',
  },
  starsWrap: {
    flexDirection: 'row',
    marginTop: 12,
  },
});
