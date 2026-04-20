import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';

import { useRestaurants, type Restaurant } from '@/src/features/browse/api/useRestaurants';
import { apiClient } from '@/src/api/apiClient';

/* ─── Constants ─── */
const RECENT_SEARCHES_DEFAULT = ['Pasta', 'Spicy Ramen', 'Sushi Box', 'Matcha Latte', 'Iced Coffee'];
const TRENDING_TAGS = ['#MidnightSnacks', '#ArtisanSourdough', '#PokeBowl', '#LowCarb'];
const { width: SCREEN_W } = Dimensions.get('window');
const GRID_GAP = 12;
const CARD_W = (SCREEN_W - 20 * 2 - GRID_GAP) / 2;

/* ─── Types ─── */
interface DishResult {
  id: string | number;
  title: string;
  description: string | null;
  price: string | number;
  image: string | null;
  rating?: number;
  reviews_count?: number;
  restaurantId: string | number;
  restaurantName: string;
}

/* ─── Helpers ─── */
function getImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  let u = url.startsWith('http') ? url : `https://foodhub.tmc-innovations.com${url}`;
  if (u.includes('/api/media/')) u = u.replace('/api/media/', '/storage/');
  return u;
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return <Text>{text}</Text>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <Text>{text}</Text>;
  return (
    <Text>
      {text.slice(0, idx)}
      <Text style={{ fontWeight: '800', color: '#AC1D10' }}>{text.slice(idx, idx + query.length)}</Text>
      {text.slice(idx + query.length)}
    </Text>
  );
}

/* ─── Hook: Fetch all menus ─── */
function useAllMenuItems(restaurants: Restaurant[] | undefined) {
  return useQuery({
    queryKey: ['all-menu-items', restaurants?.map((r) => r.id)],
    queryFn: async () => {
      if (!restaurants || restaurants.length === 0) return [];
      const allItems: DishResult[] = [];
      const results = await Promise.allSettled(
        restaurants.map((r) =>
          apiClient<any>(`/restaurants/${r.id}/menu`).then((data) => ({ restaurant: r, data })),
        ),
      );
      for (const result of results) {
        if (result.status !== 'fulfilled') continue;
        const { restaurant, data } = result.value;
        const menu = data?.menu || {};
        for (const category of Object.keys(menu)) {
          for (const item of menu[category]) {
            allItems.push({
              id: item.id,
              title: item.title,
              description: item.description,
              price: item.price,
              image: item.image,
              rating: item.rating ?? restaurant.rating ?? 4.2,
              reviews_count: item.reviews_count ?? (restaurant as any).reviews_count ?? 1972,
              restaurantId: restaurant.id,
              restaurantName: (restaurant as any).restaurant_name || restaurant.name,
            });
          }
        }
      }
      return allItems;
    },
    enabled: !!restaurants && restaurants.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════════════════════════ */
function EmptyState({
  recentSearches,
  onRemoveRecent,
  onClearAll,
  onSelectRecent,
}: {
  recentSearches: string[];
  onRemoveRecent: (s: string) => void;
  onClearAll: () => void;
  onSelectRecent: (s: string) => void;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Hero */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.heroBlock}>
        <Text style={styles.heroEmoji}>🍳</Text>
        <Text style={styles.heroTitle}>Craving Something?</Text>
        <Text style={styles.heroSub}>
          Discover the best eats in your neighborhood{'\n'}curated just for you.
        </Text>
      </Animated.View>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <Pressable onPress={onClearAll}>
              <Text style={styles.clearAll}>Clear All</Text>
            </Pressable>
          </View>
          <View style={styles.chipRow}>
            {recentSearches.map((s) => (
              <Pressable key={s} style={styles.chip} onPress={() => onSelectRecent(s)}>
                <Text style={styles.chipText}>{s}</Text>
                <Pressable hitSlop={8} onPress={() => onRemoveRecent(s)}>
                  <MaterialCommunityIcons name="close" size={14} color="#AAA" />
                </Pressable>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Trending Now */}
      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <View style={styles.trendingCard}>
          <View style={styles.trendingHeader}>
            <MaterialCommunityIcons name="trending-up" size={18} color="#AC1D10" />
            <Text style={styles.trendingLabel}>Trending Now</Text>
          </View>
          <View style={styles.chipRow}>
            {TRENDING_TAGS.map((t) => (
              <Pressable key={t} style={styles.trendingChip}>
                <Text style={styles.trendingChipText}>{t}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Animated.View>

      {/* Chef's Recommendation */}
      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <Text style={[styles.sectionTitle, { marginTop: 4, marginBottom: 12 }]}>
          Chef's Recommendation
        </Text>
        <View style={styles.chefPlaceholder}>
          <MaterialCommunityIcons name="chef-hat" size={36} color="#DDD" />
          <Text style={{ fontSize: 12, color: '#BBB', marginTop: 6 }}>Coming soon</Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NO RESULTS STATE
   ═══════════════════════════════════════════════════════════════ */
function NoResultsState({
  query,
  onRetry,
  onExplore,
  onSuggest,
}: {
  query: string;
  onRetry: () => void;
  onExplore: () => void;
  onSuggest: (s: string) => void;
}) {
  const suggestions = ['Pasta', 'Italian', 'Gluten-free', 'Truffle Pizza', 'Vegetarian', 'Truffle'];
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.noResultsWrap}>
        <View style={styles.noResultsIconCircle}>
          <MaterialCommunityIcons name="magnify" size={28} color="#CCC" />
        </View>
        <Text style={styles.noResultsTitle}>A Little Too Specific?</Text>
        <Text style={styles.noResultsSub}>
          We couldn't find matches for "<Text style={{ fontWeight: '700' }}>{query}</Text>" in your current area.
        </Text>

        <Text style={styles.tryKeywordsLabel}>TRY THESE KEYWORDS INSTEAD</Text>
        <View style={styles.suggestChips}>
          {suggestions.map((s) => (
            <Pressable key={s} style={styles.suggestChip} onPress={() => onSuggest(s)}>
              <Text style={styles.suggestChipText}>{s}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.errorBlock}>
        <Text style={styles.errorEmoji}>🍴</Text>
        <Text style={styles.errorTitle}>Something's off in the kitchen</Text>
        <Text style={styles.errorSub}>
          We couldn't find what you're looking for. Our curators are checking the ingredients, but in the meantime, let's try that again.
        </Text>
        <Pressable style={styles.retryBtn} onPress={onRetry}>
          <Text style={styles.retryBtnText}>Retry Search</Text>
        </Pressable>
        <Pressable style={styles.exploreBtn} onPress={onExplore}>
          <Text style={styles.exploreBtnText}>Explore New Flavors</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DISH GRID CARD
   ═══════════════════════════════════════════════════════════════ */
function DishGridCard({ dish, query }: { dish: DishResult; query: string }) {
  const imgUrl = getImageUrl(dish.image);
  const price = typeof dish.price === 'string' ? parseFloat(dish.price) : dish.price;

  return (
    <Pressable
      style={styles.gridCard}
      onPress={() => router.push(`/restaurant/${dish.restaurantId}`)}
    >
      <View style={styles.gridImgWrap}>
        {imgUrl ? (
          <Image source={{ uri: imgUrl }} style={styles.gridImg} contentFit="contain" />
        ) : (
          <MaterialCommunityIcons name="food" size={32} color="#DDD" />
        )}
      </View>
      <View style={styles.gridTitleRow}>
        <Text style={styles.gridName} numberOfLines={1}>
          {highlightMatch(dish.title, query)}
        </Text>
        <Text style={styles.gridPrice}>${price.toFixed(2)}</Text>
      </View>
      <Text style={styles.gridDesc} numberOfLines={1}>
        {dish.description || `A classic dish from ${dish.restaurantName}`}
      </Text>
      <View style={styles.gridRatingRow}>
        <MaterialCommunityIcons name="star" size={11} color="#F59E0B" />
        <Text style={styles.gridRatingText}>
          {dish.rating?.toFixed(1) ?? '4.2'} ({(dish.reviews_count ?? 0).toLocaleString()})
        </Text>
      </View>
    </Pressable>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RESTAURANT ROW CARD
   ═══════════════════════════════════════════════════════════════ */
function RestaurantRowCard({ item, query }: { item: Restaurant; query: string }) {
  const imgUrl = getImageUrl((item as any).cover_image) || getImageUrl(item.logo);
  const name = (item as any).restaurant_name || item.name;

  return (
    <Pressable style={styles.restRow} onPress={() => router.push(`/restaurant/${item.id}`)}>
      <View style={[styles.restRowImg, { backgroundColor: (item as any).color || '#F5F5F5' }]}>
        {imgUrl ? (
          <Image source={{ uri: imgUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        ) : (
          <MaterialCommunityIcons name="silverware-fork-knife" size={20} color="#CCC" />
        )}
      </View>
      <View style={styles.restRowInfo}>
        <Text style={styles.restRowName} numberOfLines={1}>
          {highlightMatch(name, query)}
        </Text>
        <Text style={styles.restRowMeta}>
          {(item as any).rating ?? 0}{' '}
          <MaterialCommunityIcons name="star" size={10} color="#F59E0B" /> •{' '}
          {(item as any).cuisine_type?.length
            ? (item as any).cuisine_type.join(', ')
            : (item as any).category || 'Restaurant'}{' '}
          • <MaterialCommunityIcons name="map-marker" size={10} color="#BBB" /> 1.2 miles
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
    </Pressable>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FILTER PILLS
   ═══════════════════════════════════════════════════════════════ */
function FilterPills() {
  const [active, setActive] = useState('filters');
  return (
    <View style={styles.filterRow}>
      <Pressable
        style={[styles.filterPill, active === 'filters' && styles.filterPillActive]}
        onPress={() => setActive('filters')}
      >
        <MaterialCommunityIcons
          name="filter-variant"
          size={14}
          color={active === 'filters' ? '#FFF' : '#555'}
        />
        <Text style={[styles.filterPillText, active === 'filters' && styles.filterPillTextActive]}>
          Filters
        </Text>
      </Pressable>
      <Pressable
        style={[styles.filterPill, active === 'price' && styles.filterPillActive]}
        onPress={() => setActive('price')}
      >
        <Text style={[styles.filterPillText, active === 'price' && styles.filterPillTextActive]}>
          Price: $$
        </Text>
      </Pressable>
      <Pressable
        style={[styles.filterPill, active === 'rating' && styles.filterPillActive]}
        onPress={() => setActive('rating')}
      >
        <Text style={[styles.filterPillText, active === 'rating' && styles.filterPillTextActive]}>
          Rating: 4.5 & Up
        </Text>
      </Pressable>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN SEARCH SCREEN
   ═══════════════════════════════════════════════════════════════ */
export default function SearchScreen() {
  const { data: restaurants, isLoading: isLoadingRest, isError } = useRestaurants();
  const { data: allDishes, isLoading: isLoadingDishes } = useAllMenuItems(restaurants);
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState(RECENT_SEARCHES_DEFAULT);

  const isLoading = isLoadingRest || isLoadingDishes;

  /* ── Filtered results ── */
  const filteredRestaurants = useMemo(() => {
    if (!query.trim() || !restaurants) return [];
    const q = query.toLowerCase().trim();
    return restaurants.filter((r: any) => {
      const name = (r.restaurant_name || r.name || '').toLowerCase();
      const cuisine = (r.cuisine_type || []).join(' ').toLowerCase();
      return name.includes(q) || cuisine.includes(q);
    });
  }, [query, restaurants]);

  const filteredDishes = useMemo(() => {
    if (!query.trim() || !allDishes) return [];
    const q = query.toLowerCase().trim();
    return allDishes.filter((d) => {
      return (
        d.title.toLowerCase().includes(q) ||
        (d.description || '').toLowerCase().includes(q)
      );
    });
  }, [query, allDishes]);

  const showResults = query.trim().length > 0;
  const totalResults = filteredDishes.length + filteredRestaurants.length;

  /* ── Related searches (derived from restaurant names) ── */
  const relatedSearches = useMemo(() => {
    if (!query.trim() || !restaurants) return [];
    const q = query.toLowerCase();
    const related: string[] = [];
    (restaurants as any[]).forEach((r) => {
      const name = r.restaurant_name || r.name || '';
      if (name.toLowerCase().includes(q) && !related.includes(name)) {
        related.push(name);
      }
    });
    return related.slice(0, 4);
  }, [query, restaurants]);

  /* ── Handlers ── */
  const handleClear = useCallback(() => setQuery(''), []);
  const handleRemoveRecent = useCallback(
    (s: string) => setRecentSearches((prev) => prev.filter((x) => x !== s)),
    [],
  );
  const handleClearRecents = useCallback(() => setRecentSearches([]), []);
  const handleSelectRecent = useCallback((s: string) => setQuery(s), []);
  const handleSuggest = useCallback((s: string) => setQuery(s), []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ── Search Input ── */}
      <Animated.View entering={FadeInDown.delay(50).duration(350)} style={styles.searchBar}>
        <MaterialCommunityIcons name="magnify" size={20} color="#AAA" />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search for restaurants, cuisines, or dishe..."
          placeholderTextColor="#BBB"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <Pressable onPress={handleClear} hitSlop={10}>
            <MaterialCommunityIcons name="close-circle" size={18} color="#CCC" />
          </Pressable>
        )}
      </Animated.View>

      {/* ── Body ── */}
      <View style={styles.body}>
        {!showResults ? (
          <EmptyState
            recentSearches={recentSearches}
            onRemoveRecent={handleRemoveRecent}
            onClearAll={handleClearRecents}
            onSelectRecent={handleSelectRecent}
          />
        ) : isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#AC1D10" />
            <Text style={{ color: '#AAA', marginTop: 10, fontSize: 13 }}>Searching menus...</Text>
          </View>
        ) : totalResults === 0 ? (
          <NoResultsState
            query={query}
            onRetry={() => setQuery(query)}
            onExplore={() => setQuery('')}
            onSuggest={handleSuggest}
          />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
            {/* ── DISHES Section ── */}
            {filteredDishes.length > 0 && (
              <Animated.View entering={FadeInDown.delay(80).duration(350)}>
                <View style={styles.sectionRow}>
                  <Text style={styles.categoryLabel}>DISHES</Text>
                  <Text style={styles.resultCountLabel}>{filteredDishes.length} results</Text>
                </View>

                {/* ── Dish List (first few) ── */}
                {filteredDishes.slice(0, 3).map((d) => {
                  const imgUrl = getImageUrl(d.image);
                  return (
                    <Pressable
                      key={`dish-row-${d.id}`}
                      style={styles.dishRow}
                      onPress={() => router.push(`/restaurant/${d.restaurantId}`)}
                    >
                      <View style={styles.dishRowImgWrap}>
                        {imgUrl ? (
                          <Image source={{ uri: imgUrl }} style={styles.dishRowImg} contentFit="cover" />
                        ) : (
                          <MaterialCommunityIcons name="food" size={20} color="#CCC" />
                        )}
                      </View>
                      <View style={styles.dishRowInfo}>
                        <Text style={styles.dishRowTitle} numberOfLines={1}>
                          {highlightMatch(d.title, query)}
                        </Text>
                        <Text style={styles.dishRowDesc} numberOfLines={1}>
                          {d.description || `From ${d.restaurantName}`}
                        </Text>
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={18} color="#CCC" />
                    </Pressable>
                  );
                })}
              </Animated.View>
            )}

            {/* ── RESTAURANTS Section ── */}
            {filteredRestaurants.length > 0 && (
              <Animated.View entering={FadeInDown.delay(150).duration(350)}>
                <Text style={[styles.categoryLabel, { marginTop: 16, marginBottom: 10 }]}>
                  RESTAURANTS
                </Text>
                {filteredRestaurants.map((r) => (
                  <RestaurantRowCard key={`rest-${r.id}`} item={r} query={query} />
                ))}
              </Animated.View>
            )}

            {/* ── RELATED SEARCHES ── */}
            {relatedSearches.length > 0 && (
              <Animated.View entering={FadeInDown.delay(220).duration(350)}>
                <Text style={[styles.categoryLabel, { marginTop: 16, marginBottom: 10 }]}>
                  RELATED SEARCHES
                </Text>
                <View style={styles.chipRow}>
                  {relatedSearches.map((s) => (
                    <Pressable key={s} style={styles.chip} onPress={() => setQuery(s)}>
                      <Text style={styles.chipText}>{highlightMatch(s, query)}</Text>
                    </Pressable>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* ── Full Grid Section ── */}
            {filteredDishes.length > 0 && (
              <Animated.View entering={FadeInDown.delay(280).duration(350)}>
                <View style={[styles.resultsHeader, { marginTop: 16 }]}>
                  <Text style={styles.resultsTitle}>Search Results</Text>
                  <Text style={styles.resultsSubtitle}>
                    Found {filteredDishes.length} culinary masterpiece{filteredDishes.length !== 1 ? 's' : ''} near you
                  </Text>
                </View>

                <FilterPills />

                {/* 2-column grid */}
                <View style={styles.gridContainer}>
                  {filteredDishes.map((dish, i) => (
                    <Animated.View
                      key={`grid-${dish.id}`}
                      entering={FadeInDown.delay(300 + i * 40).duration(300)}
                    >
                      <DishGridCard dish={dish} query={query} />
                    </Animated.View>
                  ))}
                </View>
              </Animated.View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════ */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 6,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1A1A1A' },
  body: { flex: 1, paddingHorizontal: 20 },

  /* Hero */
  heroBlock: { alignItems: 'center', marginTop: 30, marginBottom: 30 },
  heroEmoji: { fontSize: 40, marginBottom: 12 },
  heroTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 6 },
  heroSub: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },

  /* Section */
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  clearAll: { fontSize: 12, fontWeight: '600', color: '#AC1D10' },
  categoryLabel: { fontSize: 11, fontWeight: '700', color: '#999', letterSpacing: 0.5 },
  resultCountLabel: { fontSize: 12, fontWeight: '600', color: '#AC1D10' },

  /* Chips */
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FAFAFA',
  },
  chipText: { fontSize: 12, fontWeight: '500', color: '#555' },

  /* Trending */
  trendingCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 20,
  },
  trendingHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  trendingLabel: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  trendingChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FBE7E4',
  },
  trendingChipText: { fontSize: 12, fontWeight: '600', color: '#AC1D10' },

  /* Chef placeholder */
  chefPlaceholder: {
    height: 120,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },

  /* Loading */
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  /* Results Header */
  resultsHeader: { marginBottom: 10 },
  resultsTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 2 },
  resultsSubtitle: { fontSize: 12, color: '#888' },

  /* Filter Pills */
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFF',
  },
  filterPillActive: { backgroundColor: '#AC1D10', borderColor: '#AC1D10' },
  filterPillText: { fontSize: 12, fontWeight: '600', color: '#555' },
  filterPillTextActive: { color: '#FFF' },

  /* Dish row */
  dishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    gap: 12,
  },
  dishRowImgWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dishRowImg: { width: '100%', height: '100%' },
  dishRowInfo: { flex: 1 },
  dishRowTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
  dishRowDesc: { fontSize: 12, color: '#888' },

  /* Restaurant row */
  restRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    gap: 12,
  },
  restRowImg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restRowInfo: { flex: 1 },
  restRowName: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
  restRowMeta: { fontSize: 11, color: '#888' },

  /* Grid */
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  gridCard: {
    width: CARD_W,
    marginBottom: 4,
  },
  gridImgWrap: {
    width: CARD_W,
    height: CARD_W * 0.75,
    borderRadius: 14,
    backgroundColor: '#F8F8F8',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  gridImg: {
    width: '100%',
    height: '100%',
  },
  gridTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  gridName: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', flex: 1, marginRight: 4 },
  gridPrice: { fontSize: 13, fontWeight: '800', color: '#AC1D10' },
  gridDesc: { fontSize: 11, color: '#888', marginTop: 2 },
  gridRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  gridRatingText: { fontSize: 11, fontWeight: '600', color: '#555' },

  /* No Results */
  noResultsWrap: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
  },
  noResultsIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  noResultsTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  noResultsSub: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 20,
    marginBottom: 20,
  },
  tryKeywordsLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#AAA',
    letterSpacing: 1,
    marginBottom: 10,
  },
  suggestChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  suggestChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFF',
  },
  suggestChipText: { fontSize: 12, fontWeight: '500', color: '#555' },

  /* Error block */
  errorBlock: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 24,
    paddingTop: 28,
  },
  errorEmoji: { fontSize: 32, marginBottom: 12 },
  errorTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  errorSub: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
    marginBottom: 20,
  },
  retryBtn: {
    width: '100%',
    height: 46,
    borderRadius: 23,
    backgroundColor: '#AC1D10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  retryBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  exploreBtn: {
    width: '100%',
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  exploreBtnText: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
});
