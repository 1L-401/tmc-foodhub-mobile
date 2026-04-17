import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useRouter } from 'expo-router';

import { Image } from 'expo-image';

export type RestaurantItem = {
  id: string | number;
  name?: string;
  restaurant_name?: string;
  cuisine_type?: string[];
  rating?: number;
  reviews_count?: number;
  logo?: string | null;
  // Fallbacks from mock data
  category?: string;
  reviews?: number;
  price?: number;
  time?: string;
  color?: string;
  accent?: string;
};

export function RestaurantCard({ restaurant }: { restaurant: RestaurantItem }) {
  const router = useRouter();

  return (
    <Pressable 
      style={styles.restaurantCard}
      onPress={() => router.push(`/restaurant/${restaurant.id}`)}
    >
      {/* Image area */}
      <View style={[styles.restaurantImage, { backgroundColor: restaurant.color || '#F9F9F9' }]}>
        {restaurant.logo ? (
          <Image 
            style={{ width: '100%', height: '100%' }}
            source={{ uri: restaurant.logo?.startsWith('http') ? restaurant.logo : `https://foodhub.tmc-innovations.com${restaurant.logo}` }}
            contentFit="cover"
          />
        ) : (
          <MaterialCommunityIcons
            name="silverware-fork-knife"
            size={48}
            color={restaurant.accent || '#CCC'}
            style={{ opacity: 0.25 }}
          />
        )}
      </View>
      {/* Info */}
      <View style={styles.restaurantInfo}>
        <View style={styles.restaurantNameRow}>
          <Text style={styles.restaurantName}>{restaurant.name || restaurant.restaurant_name}</Text>
          <View style={styles.ratingBadge}>
            <MaterialCommunityIcons name="star" size={12} color="#F9A825" />
            <Text style={styles.ratingText}>
              {restaurant.rating ?? 0} ({(restaurant.reviews_count ?? restaurant.reviews ?? 0).toLocaleString()})
            </Text>
          </View>
        </View>
        <Text style={styles.restaurantCategory}>
          {restaurant.cuisine_type?.length ? restaurant.cuisine_type.join(', ') : restaurant.category || 'Restaurant'}
        </Text>
        <View style={styles.restaurantMeta}>
          <MaterialCommunityIcons name="bike-fast" size={14} color="#888" />
          <Text style={styles.metaText}>₱{restaurant.price || 50}</Text>
          <Text style={styles.metaDot}>•</Text>
          <MaterialCommunityIcons name="clock-outline" size={14} color="#888" />
          <Text style={styles.metaText}>{restaurant.time || '30-45 min'}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  restaurantCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 16,
  },
  restaurantImage: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantInfo: {
    padding: 14,
    gap: 4,
  },
  restaurantNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  restaurantCategory: {
    fontSize: 13,
    color: '#888',
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#444',
  },
  metaText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  metaDot: {
    fontSize: 12,
    color: '#CCC',
    marginHorizontal: 2,
  },
});
