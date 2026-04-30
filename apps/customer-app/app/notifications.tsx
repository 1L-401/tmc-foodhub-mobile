import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiClient } from '@/src/api/apiClient';
import { applyLocalOrderStatuses } from '@/src/features/orders/local-order-status';
import { isOngoingStatus, normalizeOrderStatus } from '@/src/features/orders/order-status';

const FILTERS = ['All', 'Orders'];

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function NotificationsScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [ongoingOrder, setOngoingOrder] = useState<any>(null);
  const [dynamicOrderNotifications, setDynamicOrderNotifications] = useState<any[]>([]);

  const fetchNotificationsData = useCallback(async () => {
    try {
      const response = await apiClient<any[]>('/orders');
      const mergedOrders = applyLocalOrderStatuses(response || []);
      
      const ongoing = mergedOrders.find((order) => isOngoingStatus(order.status));
      setOngoingOrder(ongoing ?? null);

      // Create notifications from past/recent orders
      const orderNotifications = mergedOrders
        .filter(order => order.id !== ongoing?.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map(order => ({
          id: `order-${order.id}`,
          type: 'order',
          icon: 'moped',
          iconBg: '#FFF3ED',
          iconColor: '#D9531E',
          title: `Order from ${order.store?.name || order.store_name || 'Restaurant'}`,
          rawDate: order.created_at,
          time: order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Recent',
          description: `Status: ${normalizeOrderStatus(order.status || 'unknown').toUpperCase()}. Total: ₱${Number(order.total_amount || order.total || 0).toFixed(2)}`,
          orderId: order.id,
          embeddedDetails: order.items && order.items.length > 0 && order.items[0]?.image_url ? {
            image: order.items[0].image_url,
            title: order.items.map((i: any) => i.name).join(', '),
            eta: `Order #${order.id}`,
          } : undefined,
        }));

      setDynamicOrderNotifications(orderNotifications);
    } catch (error) {
      console.error('Failed to load notifications order tracker:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotificationsData();
  }, [fetchNotificationsData]);

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

  const now = new Date().getTime();
  const recentThreshold = 24 * 60 * 60 * 1000; // 24 hours
  
  const recentNotifications = dynamicOrderNotifications.filter(
    (n) => now - new Date(n.rawDate).getTime() <= recentThreshold
  );
  
  const earlierNotifications = dynamicOrderNotifications.filter(
    (n) => now - new Date(n.rawDate).getTime() > recentThreshold
  );

  const renderCard = (item: any) => {
    return (
      <Pressable 
        key={item.id} 
        style={styles.card}
        onPress={() => {
          if (item.orderId) {
            router.push({
              pathname: '/order-tracking/[id]',
              params: { id: item.orderId },
            });
          }
        }}
      >
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
      </Pressable>
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
        {recentNotifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent</Text>
            {recentNotifications
              .filter(n => activeFilter === 'All' || n.type === activeFilter.toLowerCase().replace('s', '') || (activeFilter === 'Orders' && n.type === 'order'))
              .map(renderCard)}
          </View>
        )}

        {/* Earlier Section */}
        {earlierNotifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Earlier</Text>
            {earlierNotifications
              .filter(n => activeFilter === 'All' || n.type === activeFilter.toLowerCase().replace('s', '') || (activeFilter === 'Orders' && n.type === 'order'))
              .map(renderCard)}
          </View>
        )}
        
        {dynamicOrderNotifications.length === 0 && (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ color: '#888' }}>No notifications yet.</Text>
          </View>
        )}

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
