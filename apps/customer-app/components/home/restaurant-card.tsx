import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Image as RNImage, StyleSheet, Text, View } from 'react-native';

import { useRouter } from 'expo-router';

import { SvgXml } from 'react-native-svg';

export type RestaurantItem = {
  id: string | number;
  name?: string;
  restaurant_name?: string;
  cuisine_type?: string[];
  rating?: number;
  reviews_count?: number;
  logo?: string | null;
  cover_image?: string | null;
  // Fallbacks from mock data
  category?: string;
  reviews?: number;
  price?: number;
  time?: string;
  color?: string;
  accent?: string;
  operating_status?: string;
  available_items_count?: number;
  owner_name?: string;
  business_address?: string;
  business_contact_number?: string;
  price_range?: string | null;
};

export function RestaurantCard({ restaurant }: { restaurant: RestaurantItem }) {
  const router = useRouter();
  const inlineSvgClassFills = React.useCallback((xml: string) => {
    // Convert simple class-based fill rules (e.g. .st2{fill:#e5173f})
    // into inline fill attributes so react-native-svg preserves logo colors.
    const classFillMap = new Map<string, string>();
    const classFillRegex = /\.([a-zA-Z0-9_-]+)\s*\{[^}]*fill\s*:\s*([^;}\s]+)\s*;?[^}]*\}/g;
    let match: RegExpExecArray | null;

    while ((match = classFillRegex.exec(xml)) !== null) {
      classFillMap.set(match[1], match[2]);
    }

    if (classFillMap.size === 0) {
      return xml;
    }

    let nextXml = xml;
    classFillMap.forEach((fillValue, className) => {
      const classRegex = new RegExp(`class=["']${className}["']`, 'g');
      nextXml = nextXml.replace(classRegex, `fill="${fillValue}"`);
    });

    return nextXml;
  }, []);
  const normalizeUri = React.useCallback((uri?: string | null) => {
    if (!uri) return null;
    return uri.startsWith('http') ? uri : `https://foodhub.tmc-innovations.com${uri}`;
  }, []);

  const coverUri = normalizeUri(restaurant.cover_image);
  const logoUri = normalizeUri(restaurant.logo);
  const [currentImageUri, setCurrentImageUri] = React.useState<string | null>(coverUri || logoUri);
  const [svgXml, setSvgXml] = React.useState<string | null>(null);
  const [isSvgResolved, setIsSvgResolved] = React.useState(false);

  React.useEffect(() => {
    setCurrentImageUri(coverUri || logoUri);
  }, [coverUri, logoUri]);

  React.useEffect(() => {
    let mounted = true;

    const resolveSvg = async () => {
      setSvgXml(null);
      setIsSvgResolved(false);

      if (!currentImageUri) {
        if (mounted) setIsSvgResolved(true);
        return;
      }

      try {
        const response = await fetch(currentImageUri, {
          headers: { Accept: 'image/svg+xml,image/*,*/*' },
        });
        const contentType = (response.headers.get('content-type') || '').toLowerCase();

        if (contentType.includes('svg')) {
          const xml = await response.text();
          const isMissingImagePlaceholder = /missing image/i.test(xml);

          if (isMissingImagePlaceholder && currentImageUri === coverUri && logoUri && logoUri !== coverUri) {
            if (mounted) {
              setCurrentImageUri(logoUri);
            }
            return;
          }

          if (mounted) setSvgXml(inlineSvgClassFills(xml));
        }
      } catch {
        // Ignore and let raster image renderer handle the URI.
      } finally {
        if (mounted) setIsSvgResolved(true);
      }
    };

    resolveSvg();

    return () => {
      mounted = false;
    };
  }, [coverUri, currentImageUri, inlineSvgClassFills, logoUri]);

  const handleImageError = React.useCallback(() => {
    if (currentImageUri === coverUri && logoUri && logoUri !== coverUri) {
      setCurrentImageUri(logoUri);
      return;
    }
    setCurrentImageUri(null);
  }, [coverUri, currentImageUri, logoUri]);

  return (
    <Pressable 
      style={styles.restaurantCard}
      onPress={() => router.push(`/restaurant/${restaurant.id}`)}
    >
      {/* Image area */}
      <View style={[styles.restaurantImage, { backgroundColor: restaurant.color || '#F9F9F9' }]}>
        {currentImageUri ? (
          svgXml ? (
            <SvgXml xml={svgXml} width="100%" height="100%" />
          ) : (
            <RNImage
              style={{ width: '100%', height: '100%' }}
              source={{ uri: currentImageUri }}
              resizeMode="cover"
              onError={isSvgResolved ? handleImageError : undefined}
            />
          )
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
        {typeof restaurant.available_items_count === 'number' ? (
          <Text style={styles.restaurantCategory}>
            {restaurant.available_items_count} items available
          </Text>
        ) : null}
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
