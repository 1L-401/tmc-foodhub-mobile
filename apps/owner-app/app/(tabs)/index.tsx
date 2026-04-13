import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
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
  { icon: 'store-check-outline' as const, label: 'Review Restaurants', sub: '4 pending approvals' },
  { icon: 'gavel' as const, label: 'View Disputes', sub: '2 active cases' },
  { icon: 'package-variant-closed' as const, label: 'Manage Orders', sub: '156 active orders' },
  { icon: 'cash-multiple' as const, label: 'View Payments', sub: 'Payouts & billing' },
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
            <MaterialCommunityIcons name="bell-outline" size={24} color="#1A1A1A" />
            <MaterialCommunityIcons name="menu" size={24} color="#1A1A1A" style={{ marginLeft: 16 }} />
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
              <MaterialCommunityIcons name="account-group-outline" size={22} color="#EA580C" />
              <MaterialCommunityIcons name="storefront-outline" size={22} color="#EA580C" />
            </View>
            <Text style={styles.statCardLabel}>Total Restaurants</Text>
            <Text style={styles.statCardValue}>1,298</Text>
            <Text style={styles.statCardChange}>↑ 18.1% from yesterday</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
            <View style={styles.statCardHeader}>
              <MaterialCommunityIcons name="cash-multiple" size={22} color="#2563EB" />
              <MaterialCommunityIcons name="chart-line" size={22} color="#2563EB" />
            </View>
            <Text style={styles.statCardLabel}>Platform Revenue</Text>
            <Text style={styles.statCardValue}>₱458k</Text>
            <Text style={styles.statCardChange}>↑ 14% this week</Text>
          </View>
        </View>

        {/* ── Revenue Chart ── */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Platform Revenue</Text>
              <Text style={styles.chartSubtitle}>
                Net earnings from commissions and fees ({REVENUE_DATA.period})
              </Text>
            </View>
            <View style={styles.chartPeriodBadge}>
              <Text style={styles.chartPeriodText}>{REVENUE_DATA.period} ▾</Text>
            </View>
          </View>
          <Text style={styles.chartAmount}>{REVENUE_DATA.total}</Text>

          {/* Bar Chart */}
          <View style={styles.chartBars}>
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

          {/* Y-axis labels */}
          <View style={styles.chartYLabels}>
            <Text style={styles.chartYLabel}>₱500k</Text>
            <Text style={styles.chartYLabel}>₱400k</Text>
            <Text style={styles.chartYLabel}>₱300k</Text>
            <Text style={styles.chartYLabel}>₱200k</Text>
            <Text style={styles.chartYLabel}>₱0</Text>
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
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  {alert.time ? <Text style={styles.alertTime}>{alert.time}</Text> : null}
                </View>
                <Text style={styles.alertDescription}>{alert.description}</Text>
                <View style={[styles.alertBadge, { backgroundColor: alert.badgeBg }]}>
                  <Text style={[styles.alertBadgeText, { color: alert.badgeColor }]}>{alert.badge}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* ── Recent Restaurant Applications ── */}
        <View style={[styles.sectionHeader, { marginTop: 28 }]}>
          <Text style={styles.sectionTitle}>Recent Restaurant Applications</Text>
          <Pressable>
            <Text style={styles.viewAllText}>View all restaurants</Text>
          </Pressable>
        </View>
        <Text style={styles.sectionSubtitle}>Partners awaiting onboarding review</Text>

        {RESTAURANT_APPS.map((app, i) => (
          <View key={i} style={styles.appCard}>
            <View style={[styles.appIconWrap, { backgroundColor: app.iconBg }]}>
              <MaterialCommunityIcons name={app.icon} size={24} color={app.iconColor} />
            </View>
            <View style={styles.appContent}>
              <View style={styles.appTitleRow}>
                <Text style={styles.appName}>{app.name}</Text>
                <View style={[styles.appStatusBadge, { backgroundColor: app.statusBg }]}>
                  <Text style={[styles.appStatusText, { color: app.statusColor }]}>{app.status}</Text>
                </View>
              </View>
              <Text style={styles.appType}>{app.type}</Text>
              <Text style={styles.appLocation}>{app.location}</Text>
              <Text style={styles.appTime}>{app.time}</Text>
            </View>
          </View>
        ))}

        {/* ── Quick Actions ── */}
        <View style={[styles.sectionHeader, { marginTop: 28 }]}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <Text style={styles.sectionSubtitle}>Common admin tasks</Text>

        <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map((action, i) => (
            <Pressable key={i} style={styles.quickActionCard}>
              <MaterialCommunityIcons name={action.icon} size={24} color="#AC1D10" />
              <Text style={styles.quickActionLabel}>{action.label}</Text>
              <Text style={styles.quickActionSub}>{action.sub}</Text>
            </Pressable>
          ))}
        </View>

        {/* ── Order Trend ── */}
        <View style={[styles.sectionHeader, { marginTop: 28 }]}>
          <Text style={styles.sectionTitle}>Order Trend</Text>
        </View>
        <Text style={styles.sectionSubtitle}>Hourly - today</Text>
        <View style={styles.trendPlaceholder}>
          <MaterialCommunityIcons name="chart-areaspline" size={48} color="#E5E5E5" />
          <Text style={styles.trendPlaceholderText}>Chart loading...</Text>
        </View>

        <View style={{ height: 32 }} />
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
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  // ── Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // ── Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#1A1A1A',
  },

  // ── Welcome
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#888888',
    marginTop: 2,
  },

  // ── Stat Cards
  statCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  statCardValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 4,
    letterSpacing: -1,
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
    padding: 20,
    marginBottom: 24,
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
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
    maxWidth: 200,
  },
  chartPeriodBadge: {
    backgroundColor: '#F3F3F3',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chartPeriodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  chartAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 12,
    marginBottom: 16,
    letterSpacing: -1,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginTop: 8,
  },
  chartBarCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  chartBarTrack: {
    width: 24,
    height: 100,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 6,
  },
  chartBarLabel: {
    fontSize: 11,
    color: '#999999',
    fontWeight: '500',
  },
  chartYLabels: {
    position: 'absolute',
    left: 20,
    top: 108,
    height: 100,
    justifyContent: 'space-between',
  },
  chartYLabel: {
    fontSize: 10,
    color: '#CCCCCC',
  },

  // ── Sections
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#888888',
    marginBottom: 14,
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
    padding: 16,
    marginBottom: 12,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertContent: {
    flex: 1,
  },
  alertTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  alertTime: {
    fontSize: 12,
    color: '#BBBBBB',
    marginLeft: 8,
  },
  alertDescription: {
    fontSize: 13,
    color: '#777777',
    marginTop: 4,
    lineHeight: 18,
  },
  alertBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
  },
  alertBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Restaurant Application Cards
  appCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  appIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContent: {
    flex: 1,
  },
  appTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  appStatusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  appStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  appType: {
    fontSize: 13,
    color: '#777777',
    marginTop: 2,
  },
  appLocation: {
    fontSize: 12,
    color: '#AAAAAA',
    marginTop: 1,
  },
  appTime: {
    fontSize: 11,
    color: '#CCCCCC',
    marginTop: 4,
  },

  // ── Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 10,
  },
  quickActionSub: {
    fontSize: 12,
    color: '#AAAAAA',
    marginTop: 2,
  },

  // ── Order Trend Placeholder
  trendPlaceholder: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  trendPlaceholderText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 8,
  },
});
