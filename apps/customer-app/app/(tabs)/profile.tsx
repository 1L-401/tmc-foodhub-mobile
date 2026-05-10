import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { TmcLogo } from '@/components/tmc-logo';

import { useAuth } from '@/contexts/auth-context';
import { usePayment } from '@/components/payment';
import { useCart } from '@/components/cart';
import { apiClient } from '@/src/api/apiClient';
import { applyLocalOrderStatuses } from '@/src/features/orders/local-order-status';
import { useFocusEffect } from 'expo-router';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { preferredPayment } = usePayment();
  const [orderCount, setOrderCount] = React.useState(0);
  const [latestOrder, setLatestOrder] = React.useState<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      apiClient<any[]>('/orders').then((data) => {
        if (data) {
          const mappedOrders = applyLocalOrderStatuses(data);
          setOrderCount(mappedOrders.length);
          if (mappedOrders.length > 0) {
            setLatestOrder(mappedOrders[0]);
          }
        }
      }).catch(() => {});
    }, [])
  );

  const displayName = user?.name?.trim() ? user.name : 'Unknown User';
  const displayEmail = user?.email?.trim() ? user.email : 'No email provided';
  // Use UI Avatars to generate a fallback profile picture with initials
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=F7E8E6&color=AC1D10&size=150`;

  // Safely extract the latest order image
  const latestOrderImageRaw = latestOrder?.items?.[0]?.image;
  const latestOrderImageUrl = latestOrderImageRaw 
    ? (latestOrderImageRaw.startsWith('http') ? latestOrderImageRaw : `https://foodhub.tmc-innovations.com${latestOrderImageRaw}`)
    : 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=200&q=80';
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ── Top Header ── */}
      <Animated.View entering={FadeInDown.delay(50).duration(400)} style={styles.header}>
        <View style={styles.logoCircle}>
          <TmcLogo width={36} height={36} />
        </View>
        <Pressable style={styles.settingsBtn} onPress={() => router.push('/settings')}>
          <MaterialCommunityIcons name="cog-outline" size={20} color="#1A1A1A" />
        </Pressable>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ── Profile Info ── */}
        <Animated.View entering={FadeInDown.delay(100).duration(450)} style={styles.profileSection}>
          <Image
            source={{ uri: avatarUrl }}
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
            <Text style={styles.statVal}>{orderCount}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statVal}>$1,250</Text>
            <Text style={styles.statLabel}>Spent</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statVal}>850</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </Animated.View>

        {/* ── Recent Orders ── */}
        <Animated.View entering={FadeInDown.delay(300).duration(450)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <Pressable onPress={() => router.push('/orders/history')}>
              <Text style={styles.sectionAction}>View History</Text>
            </Pressable>
          </View>
          
          {latestOrder ? (
            <View style={styles.orderCard}>
              <Image 
                source={{ uri: latestOrderImageUrl }} 
                style={styles.orderImg} 
              />
              <View style={styles.orderMiddle}>
                <Text style={styles.orderTitle}>{latestOrder.items?.[0]?.item_name || 'Your Order'}</Text>
                <Text style={styles.orderSub}>{latestOrder.status} • {latestOrder.items?.length || 0} items • ${Number(latestOrder.total || 0).toFixed(2)}</Text>
                <Text style={styles.orderTime}>
                  {new Date(latestOrder.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
              <Pressable style={styles.reorderBtn} onPress={() => router.push('/orders/history')}>
                <Text style={styles.reorderText}>Track</Text>
              </Pressable>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#AAA" style={{ marginLeft: 6 }} />
            </View>
          ) : (
            <View style={[styles.orderCard, { justifyContent: 'center', paddingVertical: 20 }]}>
              <Text style={{ color: '#888', fontSize: 13 }}>No recent orders yet.</Text>
            </View>
          )}
        </Animated.View>

        {/* ── Vouchers ── */}
        <Animated.View entering={FadeInDown.delay(400).duration(450)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vouchers</Text>
            <Pressable>
              <Text style={styles.sectionAction}>See All</Text>
            </Pressable>
          </View>

          <View style={styles.voucherCard}>
            <View style={styles.voucherIconWrap}>
              <MaterialCommunityIcons name="ticket-percent-outline" size={24} color="#F59E0B" />
            </View>
            <View style={styles.voucherBody}>
              <View style={styles.limitedPill}>
                <Text style={styles.limitedText}>LIMITED TIME</Text>
              </View>
              <Text style={styles.voucherTitle}>15% OFF</Text>
              <Text style={styles.voucherSub}>Next Order • Code: CURATOR15</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).duration(450)} style={styles.twoColRow}>
          <Pressable style={styles.gridCard} onPress={() => router.push('/delivery-address')}>
            <View style={styles.gridIconWrap}>
              <MaterialCommunityIcons name="home" size={20} color="#AC1D10" />
            </View>
            <Text style={styles.gridSectionLabel}>HOME ADDRESS</Text>
            <Text style={styles.gridTitle} numberOfLines={1}>{user?.address ? 'Home' : 'No Address'}</Text>
            <Text style={styles.gridSub} numberOfLines={2}>{user?.address || 'Tap to set your address'}</Text>
          </Pressable>

          <Pressable style={styles.gridCard} onPress={() => router.push('/add-payment-method')}>
            <View style={styles.gridIconWrap}>
              <MaterialCommunityIcons name={(preferredPayment?.icon as any) || 'wallet'} size={20} color="#AC1D10" />
            </View>
            <Text style={styles.gridSectionLabel}>PAYMENT METHOD</Text>
            <Text style={styles.gridTitle}>{preferredPayment?.label || 'Cash'}</Text>
            <Text style={styles.gridSub}>{preferredPayment?.subtitle || 'Pay on delivery'}</Text>
          </Pressable>
        </Animated.View>

        {/* ── Share Banner ── */}
        <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.banner}>
          {/* Faint background icons */}
          <MaterialCommunityIcons name="silverware-fork-knife" size={140} color="rgba(255,255,255,0.05)" style={styles.bgIconLeft} />
          <MaterialCommunityIcons name="gift-outline" size={100} color="rgba(255,255,255,0.06)" style={styles.bgIconRight} />

          <MaterialCommunityIcons name="silverware-fork-knife" size={18} color="#F59E0B" />
          <Text style={styles.bannerTitle}>Share the Love, Get $10 Credit</Text>
          <Text style={styles.bannerSub}>Invite your friends to TMC FoodHub and you both get rewarded.</Text>
          <Pressable style={styles.bannerBtn}>
            <Text style={styles.bannerBtnText}>Invite Friends</Text>
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
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  orderImg: {
    width: 48,
    height: 48,
    borderRadius: 8,
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

  /* Voucher Card */
  voucherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    backgroundColor: '#FFF',
    marginBottom: 20,
  },
  voucherIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  voucherBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  limitedPill: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  limitedText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#444',
    letterSpacing: 0.5,
  },
  voucherTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  voucherSub: {
    fontSize: 11,
    color: '#888',
  },

  /* Address & Payment Columns */
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
    backgroundColor: '#FBE7E4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  gridSectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#AC1D10',
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
});
