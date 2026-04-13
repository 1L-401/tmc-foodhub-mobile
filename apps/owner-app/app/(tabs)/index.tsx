import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { TmcLogo } from '@/components/tmc-logo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const H_PAD = 16;
const QUICK_ACTION_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - CARD_GAP) / 2;

// ─── Mock Data ───────────────────────────────────────────────────────────────

const REVENUE_DATA = {
  total: '₱458,913.00',
  period: 'Last 7 days',
  bars: [
    { day: 'Mon', value: 0.6 },
    { day: 'Tue', value: 0.75 },
    { day: 'Wed', value: 0.85 },
    { day: 'Thu', value: 0.55 },
    { day: 'Fri', value: 0.95 },
    { day: 'Sat', value: 1.0 },
    { day: 'Sun', value: 0.7 },
  ],
};

const Y_LABELS = ['₱500k', '₱400k', '₱300k', '₱200k', '₱100k', '₱0'];
const BAR_AREA_HEIGHT = 180;

const PLATFORM_ALERTS = [
  {
    icon: 'store-alert-outline' as const,
    color: '#DC2626',
    bgColor: '#FEF2F2',
    title: 'Restaurant awaiting approval',
    description: '2 restaurants have submitted documentation for review',
    time: '2h ago',
    badge: 'Urgent',
    badgeColor: '#DC2626',
    badgeBg: '#FEF2F2',
  },
  {
    icon: 'alert-circle-outline' as const,
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    title: 'Customer dispute opened',
    description: 'Issue #80371 - Incorrect items received at Burger Hub',
    time: '3h ago',
    badge: 'Pending',
    badgeColor: '#F59E0B',
    badgeBg: '#FFFBEB',
  },
  {
    icon: 'flag-outline' as const,
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    title: '28 reviews flagged',
    description: 'Spam and fake reviews detected across 8 restaurants',
    time: '',
    badge: 'Moderation',
    badgeColor: '#3B82F6',
    badgeBg: '#EFF6FF',
  },
];

const RESTAURANT_APPS = [
  {
    name: 'Patty Shack',
    type: 'New application • Burgers',
    location: 'Session City',
    time: '3 mins ago',
    status: 'Pending',
    statusColor: '#F59E0B',
    statusBg: '#FFFBEB',
    iconBg: '#FEF2F2',
    iconColor: '#DC2626',
    icon: 'hamburger' as const,
  },
  {
    name: 'Jollibee',
    type: 'New branch • Fast Food',
    location: 'Session Road, Baguio City',
    time: '5 mins ago',
    status: 'Pending',
    statusColor: '#F59E0B',
    statusBg: '#FFFBEB',
    iconBg: '#FFF7ED',
    iconColor: '#EA580C',
    icon: 'food' as const,
  },
  {
    name: 'Mcdonalds',
    type: 'New branch • Fast Food',
    location: 'Harrison Road, Baguio City',
    time: '7 mins ago',
    status: 'In Review',
    statusColor: '#3B82F6',
    statusBg: '#EFF6FF',
    iconBg: '#FEF9C3',
    iconColor: '#CA8A04',
    icon: 'food-fork-drink' as const,
  },
  {
    name: 'Burger King',
    type: 'New branch • Fast Food',
    location: 'Leonard Wood Road, Baguio City',
    time: '2 min ago',
    status: 'Approved',
    statusColor: '#16A34A',
    statusBg: '#F0FDF4',
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    icon: 'crown-outline' as const,
  },
];

const QUICK_ACTIONS = [
  { icon: 'store-check-outline' as const, label: 'Review\nRestaurants', sub: '4 pending' },
  { icon: 'gavel' as const, label: 'View\nDisputes', sub: '2 active' },
  { icon: 'package-variant-closed' as const, label: 'Manage\nOrders', sub: '156 active' },
  { icon: 'cash-multiple' as const, label: 'View\nPayments', sub: 'Payouts' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top Bar ── */}
        <View style={styles.topBar}>
          <TmcLogo width={44} height={44} />
          <View style={styles.topBarRight}>
            <Pressable style={styles.iconButton}>
              <MaterialCommunityIcons name="bell-outline" size={22} color="#1A1A1A" />
            </Pressable>
            <Pressable style={styles.iconButton}>
              <MaterialCommunityIcons name="menu" size={22} color="#1A1A1A" />
            </Pressable>
          </View>
        </View>

        {/* ── Search ── */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#A0A0A0" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search anything..."
            placeholderTextColor="#A0A0A0"
          />
        </View>

        {/* ── Welcome ── */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Dashboard</Text>
          <Text style={styles.welcomeSubtitle}>Welcome back, Admin</Text>
        </View>

        {/* ── Stat Cards ── */}
        <View style={styles.statCardsRow}>
          <View style={[styles.statCard, { backgroundColor: '#FFF7ED' }]}>
            <View style={styles.statCardHeader}>
              <MaterialCommunityIcons name="storefront-outline" size={20} color="#EA580C" />
            </View>
            <Text style={styles.statCardLabel}>Total Restaurants</Text>
            <Text style={styles.statCardValue}>1,298</Text>
            <Text style={styles.statCardChange}>↑ 18.1% from yesterday</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
            <View style={styles.statCardHeader}>
              <MaterialCommunityIcons name="cash-multiple" size={20} color="#2563EB" />
            </View>
            <Text style={styles.statCardLabel}>Platform Revenue</Text>
            <Text style={styles.statCardValue}>₱458k</Text>
            <Text style={styles.statCardChange}>↑ 14% this week</Text>
          </View>
        </View>

        {/* ── Revenue Chart ── */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.chartTitle}>Platform Revenue</Text>
              <Text style={styles.chartSubtitle}>
                Net earnings from commissions and fees
              </Text>
            </View>
            <View style={styles.chartPeriodBadge}>
              <Text style={styles.chartPeriodText}>{REVENUE_DATA.period} ▾</Text>
            </View>
          </View>
          <Text style={styles.chartAmount}>{REVENUE_DATA.total}</Text>

          {/* Chart Area: Y-labels on the left, bars on the right */}
          <View style={styles.chartArea}>
            {/* Y-axis labels */}
            <View style={styles.chartYColumn}>
              {Y_LABELS.map((label) => (
                <Text key={label} style={styles.chartYLabel}>{label}</Text>
              ))}
            </View>

            {/* Bar chart with grid lines */}
            <View style={styles.chartBarsArea}>
              {/* Horizontal grid lines */}
              {Y_LABELS.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.gridLine,
                    { top: (BAR_AREA_HEIGHT / (Y_LABELS.length - 1)) * idx },
                  ]}
                />
              ))}

              {/* Bars */}
              <View style={styles.chartBarsRow}>
                {REVENUE_DATA.bars.map((bar) => (
                  <View key={bar.day} style={styles.chartBarCol}>
                    <View style={styles.chartBarTrack}>
                      <View
                        style={[
                          styles.chartBarFill,
                          {
                            height: `${bar.value * 100}%`,
                            backgroundColor: bar.value >= 0.9 ? '#DC2626' : '#F87171',
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.chartBarLabel}>{bar.day}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* ── Platform Alerts ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Platform Alerts</Text>
          <Pressable>
            <Text style={styles.viewAllText}>View All</Text>
          </Pressable>
        </View>
        <Text style={styles.sectionSubtitle}>Items requiring your attention</Text>

        {PLATFORM_ALERTS.map((alert, i) => (
          <View key={i} style={styles.alertCard}>
            <View style={styles.alertRow}>
              <View style={[styles.alertIconWrap, { backgroundColor: alert.bgColor }]}>
                <MaterialCommunityIcons name={alert.icon} size={20} color={alert.color} />
              </View>
              <View style={styles.alertContent}>
                <View style={styles.alertTitleRow}>
                  <Text style={styles.alertTitle} numberOfLines={1}>{alert.title}</Text>
                  {alert.time ? <Text style={styles.alertTime}>{alert.time}</Text> : null}
                </View>
                <Text style={styles.alertDescription} numberOfLines={2}>{alert.description}</Text>
                <View style={[styles.alertBadge, { backgroundColor: alert.badgeBg }]}>
                  <Text style={[styles.alertBadgeText, { color: alert.badgeColor }]}>{alert.badge}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* ── Recent Restaurant Applications ── */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Recent Applications</Text>
          <Pressable>
            <Text style={styles.viewAllText}>View all</Text>
          </Pressable>
        </View>
        <Text style={styles.sectionSubtitle}>Partners awaiting onboarding review</Text>

        {RESTAURANT_APPS.map((app, i) => (
          <View key={i} style={styles.appCard}>
            <View style={[styles.appIconWrap, { backgroundColor: app.iconBg }]}>
              <MaterialCommunityIcons name={app.icon} size={22} color={app.iconColor} />
            </View>
            <View style={styles.appContent}>
              <View style={styles.appTitleRow}>
                <Text style={styles.appName} numberOfLines={1}>{app.name}</Text>
                <View style={[styles.appStatusBadge, { backgroundColor: app.statusBg }]}>
                  <Text style={[styles.appStatusText, { color: app.statusColor }]}>{app.status}</Text>
                </View>
              </View>
              <Text style={styles.appType} numberOfLines={1}>{app.type}</Text>
              <Text style={styles.appLocation} numberOfLines={1}>{app.location}</Text>
              <Text style={styles.appTime}>{app.time}</Text>
            </View>
          </View>
        ))}

        {/* ── Quick Actions ── */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <Text style={styles.sectionSubtitle}>Common admin tasks</Text>

        <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map((action, i) => (
            <Pressable key={i} style={styles.quickActionCard}>
              <View style={styles.quickActionIconWrap}>
                <MaterialCommunityIcons name={action.icon} size={22} color="#AC1D10" />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
              <Text style={styles.quickActionSub}>{action.sub}</Text>
            </Pressable>
          ))}
        </View>

        {/* ── Order Trend ── */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Order Trend</Text>
        </View>
        <Text style={styles.sectionSubtitle}>Hourly — today</Text>
        <View style={styles.trendPlaceholder}>
          <MaterialCommunityIcons name="chart-areaspline" size={40} color="#E0E0E0" />
          <Text style={styles.trendPlaceholderText}>Chart loading...</Text>
        </View>

        {/* Bottom spacer for floating tab bar */}
        <View style={{ height: Platform.OS === 'ios' ? 100 : 96 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: H_PAD,
  },

  // ── Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },

  // ── Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#1A1A1A',
  },

  // ── Welcome
  welcomeSection: {
    marginBottom: 18,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#888888',
    marginTop: 2,
  },

  // ── Stat Cards
  statCardsRow: {
    flexDirection: 'row',
    gap: CARD_GAP,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
  },
  statCardHeader: {
    marginBottom: 10,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 4,
    letterSpacing: -0.8,
  },
  statCardChange: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '600',
    marginTop: 6,
  },

  // ── Revenue Chart
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  chartSubtitle: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  chartPeriodBadge: {
    backgroundColor: '#F3F3F3',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexShrink: 0,
  },
  chartPeriodText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666666',
  },
  chartAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 10,
    marginBottom: 12,
    letterSpacing: -0.8,
  },

  // Chart area with Y-labels + bars side by side
  chartArea: {
    flexDirection: 'row',
    marginTop: 4,
  },
  chartYColumn: {
    width: 44,
    height: BAR_AREA_HEIGHT,
    justifyContent: 'space-between',
    paddingRight: 6,
    paddingTop: 2,
  },
  chartYLabel: {
    fontSize: 10,
    color: '#CCCCCC',
    textAlign: 'right',
  },
  chartBarsArea: {
    flex: 1,
    height: BAR_AREA_HEIGHT,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#F5F5F5',
  },
  chartBarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: BAR_AREA_HEIGHT,
    paddingBottom: 20,
  },
  chartBarCol: {
    alignItems: 'center',
    gap: 6,
  },
  chartBarTrack: {
    width: 28,
    height: BAR_AREA_HEIGHT - 28,
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 5,
  },
  chartBarLabel: {
    fontSize: 10,
    color: '#999999',
    fontWeight: '500',
  },

  // ── Sections
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#AC1D10',
  },

  // ── Alert Cards
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  alertRow: {
    flexDirection: 'row',
    gap: 12,
  },
  alertIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  alertContent: {
    flex: 1,
    minWidth: 0,
  },
  alertTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  alertTime: {
    fontSize: 11,
    color: '#BBBBBB',
    flexShrink: 0,
  },
  alertDescription: {
    fontSize: 12,
    color: '#888',
    marginTop: 3,
    lineHeight: 17,
  },
  alertBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
  },
  alertBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ── Restaurant Application Cards
  appCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  appIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  appContent: {
    flex: 1,
    minWidth: 0,
  },
  appTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  appStatusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexShrink: 0,
  },
  appStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  appType: {
    fontSize: 12,
    color: '#777777',
    marginTop: 2,
  },
  appLocation: {
    fontSize: 11,
    color: '#AAAAAA',
    marginTop: 1,
  },
  appTime: {
    fontSize: 10,
    color: '#CCCCCC',
    marginTop: 3,
  },

  // ── Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  quickActionCard: {
    width: QUICK_ACTION_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  quickActionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 10,
    lineHeight: 17,
  },
  quickActionSub: {
    fontSize: 11,
    color: '#AAAAAA',
    marginTop: 2,
  },

  // ── Order Trend Placeholder
  trendPlaceholder: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  trendPlaceholderText: {
    fontSize: 13,
    color: '#CCCCCC',
    marginTop: 6,
  },
});
