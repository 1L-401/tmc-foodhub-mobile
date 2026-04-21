import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { TmcLogo } from '@/components/tmc-logo';
import { SectionHeader } from '@/components/home/section-header';
import { OrderAgainCard } from '@/components/home/order-again-card';
import { RestaurantCard } from '@/components/home/restaurant-card';
import { useRestaurants } from '@/src/features/browse/api/useRestaurants';
import {
  CUISINES,
  TOP_BRANDS,
  ORDER_AGAIN,
  FILTERS,
} from '@/constants/mock-data';

// ── Component ─────────────────────────────────────────────────
export default function HomeScreen() {
  const { data: restaurants, isLoading: isRestaurantsLoading } = useRestaurants();

  const headerScale = useSharedValue(0.95);
  const headerOpacity = useSharedValue(0);

  React.useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerScale.value = withDelay(100, withSpring(1, { damping: 12 }));
  }, []);

  const headerAnim = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ scale: headerScale.value }],
  }));
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        {/* ── Top Bar ── */}
        <Animated.View style={[styles.topBar, headerAnim]}>
          <Pressable style={{ opacity: 1 }}>
            <MaterialCommunityIcons name="menu" size={24} color="#1A1A1A" />
          </Pressable>

          <View style={styles.logoWrap}>
            <TmcLogo width={130} height={36} />
          </View>

          <View style={styles.topBarRight}>
            <Pressable style={styles.avatarWrap} onPress={() => router.push('/notifications')}>
              <MaterialCommunityIcons
                name="bell-badge-outline"
                size={22}
                color="#AC1D10"
              />
            </Pressable>
          </View>
        </Animated.View>

        {/* ── Search ── */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={styles.searchWrap}>
          <MaterialCommunityIcons name="magnify" size={18} color="#AAA" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants, cuisines..."
            placeholderTextColor="#AAA"
          />
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

        {/* ─── Cuisines ─── */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <SectionHeader title="Cuisines" />
          <FlatList
            data={CUISINES}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable style={styles.cuisineItem}>
                <View style={[styles.cuisineIcon, { backgroundColor: item.color }]}>
                  <MaterialCommunityIcons name={item.icon as any} size={26} color={item.iconColor} />
                </View>
                <Text style={styles.cuisineLabel}>{item.name}</Text>
              </Pressable>
            )}
          />
        </Animated.View>

        {/* ─── Top Brands ─── */}
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <SectionHeader title="Top brands" />
          <FlatList
            data={TOP_BRANDS}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable style={styles.brandItem}>
                <View style={[styles.brandIcon, { backgroundColor: item.bgColor }]}>
                  <MaterialCommunityIcons name={item.icon as any} size={28} color="#1A1A1A" />
                </View>
                <Text style={styles.brandLabel} numberOfLines={1}>{item.name}</Text>
              </Pressable>
            )}
          />
        </Animated.View>

        {/* ─── Order Again ─── */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <SectionHeader title="Order again" />
          <FlatList
            data={ORDER_AGAIN}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <OrderAgainCard item={item} />
            )}
          />
        </Animated.View>

        {/* ─── Explore Restaurants Nearby ─── */}
        <Animated.View entering={FadeInDown.delay(250).springify()}>
          <Text style={styles.exploreTitle}>Explore restaurants nearby</Text>

          {/* Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            <Pressable style={styles.filterIconButton}>
              <MaterialCommunityIcons name="tune-variant" size={18} color="#1A1A1A" />
            </Pressable>
            {FILTERS.map((filter) => (
              <Pressable key={filter} style={styles.filterChip}>
                <Text style={styles.filterChipText}>{filter}</Text>
                <MaterialCommunityIcons name="chevron-down" size={16} color="#555" />
              </Pressable>
            ))}
          </ScrollView>

          {/* Restaurant Cards */}
          {isRestaurantsLoading ? (
            <ActivityIndicator size="large" color="#AC1D10" style={{ marginTop: 40 }} />
          ) : (
            restaurants?.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant as any} />
            ))
          )}
        </Animated.View>

        {/* Bottom spacer */}
        <View style={{ height: 80 }} />
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  topBarRight: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FBE7E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 4,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#1A1A1A' },
  horizontalList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  cuisineItem: {
    alignItems: 'center',
    gap: 8,
  },
  cuisineIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3D8D8',
  },
  cuisineLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E170C',
  },
  brandItem: {
    alignItems: 'center',
    gap: 8,
    width: 68,
  },
  brandIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  brandLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#444',
    textAlign: 'center',
  },
  exploreTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  filterIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 14,
    gap: 4,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#444',
  },
});
