import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.55;

export type OrderAgainItem = {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  price: number;
  time: string;
  color: string;
};

export function OrderAgainCard({ item }: { item: OrderAgainItem }) {
  const router = useRouter();

  return (
    <Pressable 
      style={styles.orderAgainCard}
      onPress={() => router.push(`/restaurant/${item.id}`)}
    >
      {/* Image placeholder */}
      <View style={[styles.orderAgainImage, { backgroundColor: item.color }]}>
        <MaterialCommunityIcons name="food" size={40} color="rgba(255,255,255,0.3)" />
      </View>
      {/* Info */}
      <View style={styles.orderAgainInfo}>
        <View style={styles.orderAgainNameRow}>
          <Text style={styles.orderAgainName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.ratingBadge}>
            <MaterialCommunityIcons name="star" size={12} color="#F9A825" />
            <Text style={styles.ratingText}>{item.rating} ({item.reviews.toLocaleString()})</Text>
          </View>
        </View>
        <Text style={styles.orderAgainCategory}>{item.category}</Text>
        <View style={styles.orderAgainMeta}>
          <MaterialCommunityIcons name="bike-fast" size={14} color="#888" />
          <Text style={styles.metaText}>₱{item.price}</Text>
          <Text style={styles.metaDot}>•</Text>
          <MaterialCommunityIcons name="clock-outline" size={14} color="#888" />
          <Text style={styles.metaText}>{item.time}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  orderAgainCard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  orderAgainImage: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderAgainInfo: {
    padding: 12,
    gap: 4,
  },
  orderAgainNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderAgainName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 4,
  },
  orderAgainCategory: {
    fontSize: 12,
    color: '#888',
  },
  orderAgainMeta: {
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
