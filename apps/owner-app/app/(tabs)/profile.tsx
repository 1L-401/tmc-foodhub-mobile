import { useQuery } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAuth } from '@/context/AuthContext';
import { fetchOwnerProfile } from '@/services/ownerProfileService';
import { fetchOwnerOrders, ownerOrderQueryKeys } from '@/services/orderService';
import { fetchInventoryItems, inventoryQueryKeys } from '@/services/inventoryService';
import { resolveApiMediaUrl } from '@/src/api/apiConfig';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['owner', 'profile'],
    queryFn: () => fetchOwnerProfile(),
    initialData: user || undefined,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ownerOrderQueryKeys.all,
    queryFn: fetchOwnerOrders,
  });

  const { data: inventoryItems = [] } = useQuery({
    queryKey: inventoryQueryKeys.items,
    queryFn: fetchInventoryItems,
  });

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter((o) => ['Delivered', 'Out for Delivery', 'Order Confirmed'].includes(o.status))
      .reduce((acc, o) => acc + o.total, 0);
    const totalItems = inventoryItems.length;

    return { totalOrders, totalRevenue, totalItems };
  }, [orders, inventoryItems]);

  const latestOrder = useMemo(() => {
    return orders.length > 0 ? orders[0] : null;
  }, [orders]);

  const displayName = profile?.restaurant_name?.trim() || profile?.name?.trim() || 'Unknown Restaurant';
  const displayEmail = profile?.email?.trim() || 'No email provided';
  const logoUrl = profile?.logo ? resolveApiMediaUrl(profile.logo) : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=F7E8E6&color=AC1D10&size=150`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ── Top Header ── */}
      <Animated.View entering={FadeInDown.delay(50).duration(400)} style={styles.header}>
        <View style={styles.logoWrap}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoText}>TMC</Text>
          </View>
          <Text style={styles.logoTitle}>
            FOOD{'\n'}
            <Text style={styles.logoBold}>HUB</Text>
          </Text>
        </View>
        <Pressable style={styles.settingsBtn} onPress={() => router.push('/more')}>
          <MaterialCommunityIcons name="cog-outline" size={20} color="#1A1A1A" />
        </Pressable>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ── Profile Info ── */}
        <Animated.View entering={FadeInDown.delay(100).duration(450)} style={styles.profileSection}>
          <Image
            source={{ uri: logoUrl }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{displayEmail}</Text>
          <Pressable style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </Pressable>
        </Animated.View>

        {/* ── Stats Row ── */}
        <Animated.View entering={FadeInDown.delay(200).duration(450)} style={styles.statsRow}>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>{stats.totalOrders}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statVal}>₱{stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statVal}>{stats.totalItems}</Text>
            <Text style={styles.statLabel}>Menu Items</Text>
          </View>
        </Animated.View>

        {/* ── Recent Orders ── */}
        <Animated.View entering={FadeInDown.delay(300).duration(450)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <Pressable onPress={() => router.push('/(tabs)/orders')}>
              <Text style={styles.sectionAction}>View All</Text>
            </Pressable>
          </View>
          
          {latestOrder ? (
            <View style={styles.orderCard}>
              <View style={styles.orderIconWrap}>
                <MaterialCommunityIcons name="shopping-outline" size={24} color="#AC1D10" />
              </View>
              <View style={styles.orderMiddle}>
                <Text style={styles.orderTitle}>{latestOrder.orderNumber}</Text>
                <Text style={styles.orderSub}>{latestOrder.status} • {latestOrder.itemsSummary || 'Items'} • ₱{Number(latestOrder.total || 0).toFixed(2)}</Text>
                <Text style={styles.orderTime}>
                  {latestOrder.timeAgo}
                </Text>
              </View>
              <Pressable style={styles.reorderBtn} onPress={() => router.push({ pathname: '/order-details', params: { id: latestOrder.id } })}>
                <Text style={styles.reorderText}>View</Text>
              </Pressable>
            </View>
          ) : (
            <View style={[styles.orderCard, { justifyContent: 'center', paddingVertical: 20 }]}>
              <Text style={{ color: '#888', fontSize: 13 }}>No recent orders yet.</Text>
            </View>
          )}
        </Animated.View>

        {/* ── Quick Links ── */}
        <Animated.View entering={FadeInDown.delay(500).duration(450)} style={styles.twoColRow}>
          <Pressable style={styles.gridCard} onPress={() => router.push('/payouts')}>
            <View style={[styles.gridIconWrap, { backgroundColor: '#E1F6EB' }]}>
              <MaterialCommunityIcons name="cash" size={20} color="#059669" />
            </View>
            <Text style={[styles.gridSectionLabel, { color: '#059669' }]}>FINANCE</Text>
            <Text style={styles.gridTitle}>Payouts</Text>
            <Text style={styles.gridSub}>Manage withdrawals</Text>
          </Pressable>

          <Pressable style={styles.gridCard} onPress={() => router.push('/analytics')}>
            <View style={[styles.gridIconWrap, { backgroundColor: '#E0E7FF' }]}>
              <MaterialCommunityIcons name="chart-bar" size={20} color="#1D4ED8" />
            </View>
            <Text style={[styles.gridSectionLabel, { color: '#1D4ED8' }]}>INSIGHTS</Text>
            <Text style={styles.gridTitle}>Analytics</Text>
            <Text style={styles.gridSub}>Sales and traffic</Text>
          </Pressable>
        </Animated.View>

        {/* ── Share Banner ── */}
        <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.banner}>
          <MaterialCommunityIcons name="storefront" size={140} color="rgba(255,255,255,0.05)" style={styles.bgIconLeft} />
          <MaterialCommunityIcons name="bullhorn-outline" size={100} color="rgba(255,255,255,0.06)" style={styles.bgIconRight} />

          <MaterialCommunityIcons name="bullhorn" size={18} color="#F59E0B" />
          <Text style={styles.bannerTitle}>Promote Your Restaurant</Text>
          <Text style={styles.bannerSub}>Create marketing campaigns to reach more customers and boost your sales.</Text>
          <Pressable style={styles.bannerBtn} onPress={() => router.push('/promotions')}>
            <Text style={styles.bannerBtnText}>Create Promo</Text>
          </Pressable>
        </Animated.View>

        {/* ── Logout Button ── */}
        <Animated.View entering={FadeInDown.delay(700).duration(500)} style={{ marginTop: 24, alignItems: 'center' }}>
          <Pressable 
            style={styles.logoutBtn} 
            onPress={async () => {
              await logout();
              router.replace('/(auth)/login');
            }}
          >
            <MaterialCommunityIcons name="logout" size={20} color="#AC1D10" style={{ marginRight: 8 }} />
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </Pressable>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
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
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  
  /* Profile Info */
  profileSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  email: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
  },
  editBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FAFAFA',
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },

  /* Stats Row */
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#EFEFEF',
  },

  /* Section Header */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sectionAction: {
    fontSize: 12,
    fontWeight: '700',
    color: '#AC1D10',
  },

  /* Order Card */
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    backgroundColor: '#FFF',
    marginBottom: 20,
  },
  orderIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FBE7E4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  orderMiddle: {
    flex: 1,
    justifyContent: 'center',
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  orderSub: {
    fontSize: 11,
    color: '#888',
    marginBottom: 2,
  },
  orderTime: {
    fontSize: 11,
    color: '#BBB',
  },
  reorderBtn: {
    backgroundColor: '#FBE7E4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  reorderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#AC1D10',
  },

  /* Columns */
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  gridCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    backgroundColor: '#FFF',
    padding: 14,
  },
  gridIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F0F5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  gridSectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1D4ED8',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  gridSub: {
    fontSize: 11,
    color: '#888',
  },

  /* Banner */
  banner: {
    backgroundColor: '#9A1608',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  bgIconLeft: {
    position: 'absolute',
    left: -40,
    bottom: -30,
    transform: [{ rotate: '-15deg' }],
  },
  bgIconRight: {
    position: 'absolute',
    right: -20,
    top: 20,
    transform: [{ rotate: '15deg' }],
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 10,
    marginBottom: 6,
    textAlign: 'center',
  },
  bannerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  bannerBtn: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bannerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9A1608',
  },
  
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FBE7E4',
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#AC1D10',
  },
});
