import React, { useState, useMemo, useCallback } from 'react';
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

import { useRestaurants, Restaurant } from '@/src/features/browse/api/useRestaurants';

/* ─── Constants ─── */
const RECENT_SEARCHES = ['Pasta', 'Spicy Ramen', 'Sushi Box', 'Matcha Latte', 'Iced Coffee'];
const TRENDING_TAGS = ['#MidnightSnacks', '#ArtisanSourdough', '#PokeBowl', '#LowCarb'];
const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = (SCREEN_W - 20 * 2 - 12) / 2;

/* ─── Helpers ─── */
function getImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  let u = url.startsWith('http') ? url : `https://foodhub.tmc-innovations.com${url}`;
  if (u.includes('/api/media/')) u = u.replace('/api/media/', '/storage/');
  return u;
}

/* ─── Empty State ─── */
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
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
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
            <Text style={styles.trendingTitle}>Trending Now</Text>
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

      {/* Chef's Recommendation (placeholder) */}
      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <Text style={[styles.sectionTitle, { marginTop: 8, marginBottom: 12 }]}>
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

/* ─── Restaurant Result Card ─── */
function RestaurantResultCard({ item }: { item: Restaurant }) {
  const imgUrl = getImageUrl((item as any).cover_image) || getImageUrl(item.logo);

  return (
    <Pressable
      style={styles.resultCard}
      onPress={() => router.push(`/restaurant/${item.id}`)}
    >
      <View style={[styles.resultImgWrap, { backgroundColor: (item as any).color || '#F5F5F5' }]}>
        {imgUrl ? (
          <Image source={{ uri: imgUrl }} style={styles.resultImg} contentFit="cover" />
        ) : (
          <MaterialCommunityIcons name="silverware-fork-knife" size={32} color="#CCC" />
        )}
      </View>
      <View style={styles.resultInfo}>
        <View style={styles.resultTitleRow}>
          <Text style={styles.resultName} numberOfLines={1}>
            {(item as any).restaurant_name || item.name}
          </Text>
        </View>
        <Text style={styles.resultSub} numberOfLines={1}>
          {(item as any).cuisine_type?.length
            ? (item as any).cuisine_type.join(', ')
            : (item as any).category || 'Restaurant'}
        </Text>
        <View style={styles.resultMeta}>
          <MaterialCommunityIcons name="star" size={12} color="#F59E0B" />
          <Text style={styles.resultMetaText}>
            {(item as any).rating ?? 0} ({((item as any).reviews_count ?? (item as any).reviews ?? 0).toLocaleString()})
          </Text>
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
    </Pressable>
  );
}

/* ─── Main Search Screen ─── */
export default function SearchScreen() {
  const { data: restaurants, isLoading } = useRestaurants();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState(RECENT_SEARCHES);

  const filtered = useMemo(() => {
    if (!query.trim() || !restaurants) return [];
    const q = query.toLowerCase().trim();
    return restaurants.filter((r: any) => {
      const name = (r.restaurant_name || r.name || '').toLowerCase();
      const cuisine = (r.cuisine_type || []).join(' ').toLowerCase();
      const category = (r.category || '').toLowerCase();
      return name.includes(q) || cuisine.includes(q) || category.includes(q);
    });
  }, [query, restaurants]);

  const showResults = query.trim().length > 0;

  const handleClear = useCallback(() => setQuery(''), []);
  const handleRemoveRecent = useCallback(
    (s: string) => setRecentSearches((prev) => prev.filter((x) => x !== s)),
    [],
  );
  const handleClearRecents = useCallback(() => setRecentSearches([]), []);
  const handleSelectRecent = useCallback((s: string) => setQuery(s), []);

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
          </View>
        ) : (
          <>
            {/* Results Header */}
            <Animated.View entering={FadeInDown.delay(80).duration(300)} style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Search Results</Text>
              <Text style={styles.resultsCount}>
                Found {filtered.length} culinary masterpiece{filtered.length !== 1 ? 's' : ''} near you
              </Text>
            </Animated.View>

            {filtered.length === 0 ? (
              <View style={styles.noResultsWrap}>
                <MaterialCommunityIcons name="magnify-close" size={48} color="#DDD" />
                <Text style={styles.noResultsTitle}>No results found</Text>
                <Text style={styles.noResultsSub}>
                  Try a different spelling or explore our trending picks!
                </Text>
              </View>
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(item) => String(item.id)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                renderItem={({ item, index }) => (
                  <Animated.View entering={FadeInDown.delay(100 + index * 60).duration(350)}>
                    <RestaurantResultCard item={item} />
                  </Animated.View>
                )}
              />
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

/* ─── Styles ─── */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
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
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
  },

  /* Hero */
  heroBlock: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  heroEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },

  /* Section Header */
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  clearAll: {
    fontSize: 12,
    fontWeight: '600',
    color: '#AC1D10',
  },

  /* Chips */
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
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
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555',
  },

  /* Trending */
  trendingCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 20,
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  trendingChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FBE7E4',
  },
  trendingChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#AC1D10',
  },

  /* Chef Placeholder */
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
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Results Header */
  resultsHeader: {
    marginBottom: 14,
    marginTop: 4,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  resultsCount: {
    fontSize: 12,
    color: '#888',
  },

  /* No Results */
  noResultsWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  noResultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 12,
    marginBottom: 4,
  },
  noResultsSub: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  /* Result Card */
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFF',
    marginBottom: 10,
    gap: 12,
  },
  resultImgWrap: {
    width: 54,
    height: 54,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultImg: {
    width: '100%',
    height: '100%',
  },
  resultInfo: {
    flex: 1,
  },
  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  resultSub: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  resultMetaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555',
  },
});
