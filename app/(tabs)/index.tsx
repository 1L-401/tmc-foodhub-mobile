import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { TmcLogo } from '@/components/tmc-logo';
import { SectionHeader } from '@/components/home/section-header';
import { OrderAgainCard } from '@/components/home/order-again-card';
import { RestaurantCard } from '@/components/home/restaurant-card';
import {
  CUISINES,
  TOP_BRANDS,
  ORDER_AGAIN,
  RESTAURANTS,
  FILTERS,
} from '@/constants/mock-data';

// ── Component ─────────────────────────────────────────────────
export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Top Bar ─── */}
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.topBar}>
          <TmcLogo width={40} height={40} />
          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={20} color="#999" />
            <Text style={styles.searchPlaceholder}>Search for restaurants, cuisines, o...</Text>
          </View>
          <Pressable style={styles.notifButton}>
            <MaterialCommunityIcons name="bell-outline" size={24} color="#1A1A1A" />
          </Pressable>
        </Animated.View>

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
          {RESTAURANTS.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </Animated.View>

        {/* Bottom spacer */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 42,
    gap: 8,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: '#999',
    flex: 1,
  },
  notifButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
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
