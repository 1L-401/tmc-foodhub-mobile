import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type RestaurantItem = {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  price: number;
  time: string;
  color: string;
  accent: string;
};

export function RestaurantCard({ restaurant }: { restaurant: RestaurantItem }) {
  return (
    <Pressable style={styles.restaurantCard}>
      {/* Image area */}
      <View style={[styles.restaurantImage, { backgroundColor: restaurant.color }]}>
        <MaterialCommunityIcons
          name="silverware-fork-knife"
          size={48}
          color={restaurant.accent}
          style={{ opacity: 0.25 }}
        />
      </View>
      {/* Info */}
      <View style={styles.restaurantInfo}>
        <View style={styles.restaurantNameRow}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <View style={styles.ratingBadge}>
            <MaterialCommunityIcons name="star" size={12} color="#F9A825" />
            <Text style={styles.ratingText}>
              {restaurant.rating} ({restaurant.reviews.toLocaleString()})
            </Text>
          </View>
        </View>
        <Text style={styles.restaurantCategory}>{restaurant.category}</Text>
        <View style={styles.restaurantMeta}>
          <MaterialCommunityIcons name="bike-fast" size={14} color="#888" />
          <Text style={styles.metaText}>₱{restaurant.price}</Text>
          <Text style={styles.metaDot}>•</Text>
          <MaterialCommunityIcons name="clock-outline" size={14} color="#888" />
          <Text style={styles.metaText}>{restaurant.time}</Text>
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
