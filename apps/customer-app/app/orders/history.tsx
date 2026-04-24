import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { apiClient } from '@/src/api/apiClient';

interface OrderItem {
  id: number;
  item_name: string;
  quantity: number;
  price: string | number;
  image: string | null;
}

interface Order {
  id: number;
  store_name: string;
  total: string | number;
  status: string;
  created_at: string;
  payment_method?: string;
  items: OrderItem[];
}

type TabType = 'Ongoing' | 'Completed' | 'Cancelled';

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('Ongoing');

  const fetchOrders = async () => {
    try {
      const response = await apiClient<Order[]>('/orders');
      setOrders(response || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const loadInitial = async () => {
    setIsLoading(true);
    await fetchOrders();
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadInitial();
  }, []);

  const ongoingOrders = orders.filter((o) => ['Pending', 'Order Confirmed', 'Out for Delivery'].includes(o.status));
  const completedOrders = orders.filter((o) => o.status === 'Delivered');
  const cancelledOrders = orders.filter((o) => o.status === 'Cancelled');

  const filteredOrders = activeTab === 'Ongoing' ? ongoingOrders : activeTab === 'Completed' ? completedOrders : cancelledOrders;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return '#10B981'; // Green
      case 'Cancelled':
        return '#EF4444'; // Red
      case 'Pending':
      case 'Order Confirmed':
        return '#F59E0B'; // Orange
      case 'Out for Delivery':
        return '#3B82F6'; // Blue
      default:
        return '#6B7280'; // Gray
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return '#D1FAE5'; 
      case 'Cancelled':
        return '#FEE2E2'; 
      case 'Pending':
      case 'Order Confirmed':
        return '#FEF3C7'; 
      case 'Out for Delivery':
        return '#DBEAFE'; 
      default:
        return '#F3F4F6'; 
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const date = new Date(item.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const time = new Date(item.created_at).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    const firstItem = item.items[0];
    const firstItemImage = firstItem?.image;
    const imageUrl = firstItemImage 
      ? (firstItemImage.startsWith('http') ? firstItemImage : `https://foodhub.tmc-innovations.com${firstItemImage}`) 
      : null;

    const extraCount = item.items.length > 1 ? item.items.length - 1 : 0;

    return (
      <View style={styles.orderCard}>
        {/* Top Meta Row */}
        <View style={styles.cardHeader}>
          <View>
            <View style={styles.orderIdPill}>
              <Text style={styles.orderIdText}>ORD-000{item.id}</Text>
            </View>
            <Text style={styles.dateText}>{date} at {time}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: getStatusBgColor(item.status) }]}>
            <MaterialCommunityIcons 
              name={item.status === 'Delivered' ? 'check-circle-outline' : 'clock-outline'} 
              size={12} 
              color={getStatusColor(item.status)} 
              style={{ marginRight: 4 }} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>

        {/* Store Name */}
        <View style={styles.storeRow}>
          <MaterialCommunityIcons name="storefront-outline" size={16} color="#1A1A1A" />
          <Text style={styles.storeName}>{item.store_name}</Text>
        </View>

        {/* Item Block */}
        {firstItem && (
          <View style={styles.itemBlock}>
            <View style={styles.itemImageWrap}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.itemImage} />
              ) : (
                <MaterialCommunityIcons name="silverware-fork-knife" size={16} color="#AC1D10" />
              )}
            </View>
            <View style={styles.itemDetails}>
              <Text style={styles.itemSummary} numberOfLines={1}>
                {firstItem.item_name}
              </Text>
              <Text style={styles.itemQuantity}>x{firstItem.quantity}</Text>
            </View>
            {extraCount > 0 && (
              <Text style={styles.extraItems}>+{extraCount}</Text>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.totalWrap}>
            <Text style={styles.price}>${Number(item.total).toFixed(2)}</Text>
            <Text style={styles.paymentMethod}>{item.payment_method?.toUpperCase() || 'CASH'}</Text>
          </View>

          <View style={styles.actionRow}>
            {item.status === 'Delivered' && (
              <Pressable style={styles.actionBtnYellow}>
                <MaterialCommunityIcons name="star-outline" size={14} color="#D97706" style={{ marginRight: 4 }} />
                <Text style={styles.actionBtnTextYellow}>Leave Review</Text>
              </Pressable>
            )}
            {item.status !== 'Delivered' && (
              <Pressable style={styles.actionBtnGray}>
                <Text style={styles.actionBtnTextGray}>Track Order</Text>
              </Pressable>
            )}
            <Pressable style={styles.actionBtnPrimary}>
              <Text style={styles.actionBtnTextPrimary}>Reorder</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={26} color="#1A1A1A" />
        </Pressable>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>My Orders</Text>
        <Text style={styles.pageSub}>Track and manage all your food orders in one place.</Text>
      </View>

      <View style={styles.tabsContainer}>
        {(['Ongoing', 'Completed', 'Cancelled'] as TabType[]).map((tab) => {
          const isActive = activeTab === tab;
          const count = tab === 'Ongoing' ? ongoingOrders.length : tab === 'Completed' ? completedOrders.length : cancelledOrders.length;
          const icon = tab === 'Ongoing' ? 'truck-delivery-outline' : tab === 'Completed' ? 'check-circle-outline' : 'close-circle-outline';
          
          return (
            <Pressable 
              key={tab} 
              style={[styles.tabBtn, isActive && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}>
              <MaterialCommunityIcons 
                name={icon} 
                size={16} 
                color={isActive ? '#AC1D10' : '#8A8A8A'} 
                style={{ marginRight: 6 }} 
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{count}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#AC1D10" />
        </View>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="receipt" size={64} color="#E5E5E5" />
          <Text style={styles.emptyTitle}>No {activeTab} Orders</Text>
          <Text style={styles.emptySub}>When you have {activeTab.toLowerCase()} orders, they will appear here.</Text>
          <Pressable style={styles.browseBtn} onPress={() => router.push('/(tabs)')}>
            <Text style={styles.browseBtnText}>Browse Restaurants</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#AC1D10']}
              tintColor="#AC1D10"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A8A8A',
  },
  headerSpacer: {
    width: 36,
  },
  pageHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  pageSub: {
    fontSize: 14,
    color: '#888',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#AC1D10',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A8A8A',
  },
  tabTextActive: {
    color: '#AC1D10',
  },
  tabBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  browseBtn: {
    backgroundColor: '#AC1D10',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderIdPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  orderIdText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  dateText: {
    fontSize: 11,
    color: '#8A8A8A',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 6,
  },
  itemBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 16,
  },
  itemImageWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    marginRight: 12,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemDetails: {
    flex: 1,
  },
  itemSummary: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#8A8A8A',
  },
  extraItems: {
    fontSize: 12,
    color: '#8A8A8A',
    marginLeft: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  totalWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
    marginRight: 6,
  },
  paymentMethod: {
    fontSize: 11,
    color: '#8A8A8A',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnYellow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  actionBtnTextYellow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  actionBtnGray: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionBtnTextGray: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  actionBtnPrimary: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionBtnTextPrimary: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  pressed: {
    opacity: 0.7,
  },
});
