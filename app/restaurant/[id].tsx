import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
  TextInput,
  ScrollView,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { RESTAURANT_MENU } from '@/constants/mock-data';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2; // 16 margin on sides + 16 gap

export default function RestaurantDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('Popular');

  const { restaurant, menuCategories, items } = RESTAURANT_MENU;

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Back Button */}
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <MaterialCommunityIcons name="chevron-left" size={28} color="#1A1A1A" />
      </Pressable>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image style={styles.logo} source={{ uri: restaurant.logo }} />
      </View>

      {/* Info */}
      <Text style={styles.restaurantName}>{restaurant.name}</Text>
      <View style={styles.tagsRow}>
        <Text style={styles.brandTag}>{restaurant.categories.join(' • ')}</Text>
        <Text style={styles.dot}>•</Text>
        <MaterialCommunityIcons name="star" size={14} color="#F9A825" />
        <MaterialCommunityIcons name="star" size={14} color="#F9A825" />
        <MaterialCommunityIcons name="star" size={14} color="#F9A825" />
        <MaterialCommunityIcons name="star" size={14} color="#F9A825" />
        <MaterialCommunityIcons name="star-half" size={14} color="#F9A825" />
        <Text style={styles.ratingText}>
          {restaurant.rating} <Text style={styles.reviewsText}>({restaurant.reviews.toLocaleString()})</Text>
        </Text>
      </View>

      <View style={styles.statusRow}>
        {restaurant.isOpen && (
          <View style={styles.openBadge}>
            <Text style={styles.openBadgeText}>• Open Now</Text>
          </View>
        )}
        <Text style={styles.dot}>•</Text>
        <MaterialCommunityIcons name="navigation-variant" size={14} color="#888" style={{ transform: [{ rotate: '45deg' }] }} />
        <Text style={styles.statusText}>{restaurant.distance}</Text>
        <Text style={styles.dot}>•</Text>
        <MaterialCommunityIcons name="clock-outline" size={14} color="#888" />
        <Text style={styles.statusText}>{restaurant.deliveryTime}</Text>
      </View>

      {/* Search & Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color="#666" />
          <TextInput
            placeholder="Search for restaurants, cuisines, or dishes..."
            placeholderTextColor="#999"
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        <Pressable style={styles.iconFilter}>
          <MaterialCommunityIcons name="tune-variant" size={18} color="#1A1A1A" />
        </Pressable>
        <Pressable style={styles.chipButton}>
          <Text style={styles.chipText}>Category</Text>
          <MaterialCommunityIcons name="chevron-down" size={16} color="#666" />
        </Pressable>
        <Pressable style={styles.chipButton}>
          <Text style={styles.chipText}>Dietary Preference</Text>
          <MaterialCommunityIcons name="chevron-down" size={16} color="#666" />
        </Pressable>
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {menuCategories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <Pressable
                key={cat}
                style={[styles.tabItem, isActive && styles.activeTabItem]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.tabText, isActive && styles.activeTabText]}>{cat}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.tabsBorder} />
      </View>

      <Text style={styles.sectionTitle}>{activeCategory}</Text>
    </View>
  );

  const renderItem = ({ item }: { item: typeof items[0] }) => (
    <View style={styles.menuCard}>
      {item.isBestSeller && (
        <View style={styles.bestSellerBadge}>
          <Text style={styles.bestSellerText}>Best Seller</Text>
        </View>
      )}
      <Image style={styles.menuImage} source={{ uri: item.image }} resizeMode="contain" />
      
      <View style={styles.menuContent}>
        <View style={styles.menuTitleRow}>
          <Text style={styles.menuTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.menuPrice}>${item.price.toFixed(2)}</Text>
        </View>
        <Text style={styles.menuDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.menuBottom}>
          <MaterialCommunityIcons name="star" size={12} color="#F9A825" />
          <Text style={styles.itemRatingText}>
            {item.rating} <Text style={styles.itemReviews}>({item.reviews.toLocaleString()})</Text>
          </Text>
        </View>
      </View>
      
      <Pressable style={styles.addButton}>
        <MaterialCommunityIcons name="cart-outline" size={20} color="#FFF" />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <FlatList
        data={items.filter(item => item.category === activeCategory)}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    paddingTop: 16,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 10,
    padding: 4,
  },
  logoContainer: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    overflow: 'hidden',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 12,
  },
  brandTag: {
    fontSize: 13,
    fontWeight: '700',
    color: '#AC1D10',
  },
  dot: {
    fontSize: 12,
    color: '#CCC',
    marginHorizontal: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 2,
  },
  reviewsText: {
    fontWeight: '400',
    color: '#888',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  openBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  openBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  statusText: {
    fontSize: 13,
    color: '#666',
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 20,
  },
  iconFilter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 14,
    gap: 6,
  },
  chipText: {
    fontSize: 13,
    color: '#444',
  },
  tabsWrapper: {
    position: 'relative',
    paddingHorizontal: 16,
  },
  tabsBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#EFEFEF',
    zIndex: -1,
  },
  tabItem: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: '#AC1D10',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#999',
  },
  activeTabText: {
    color: '#AC1D10',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 40,
  },
  columnWrapper: {
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  menuCard: {
    width: COLUMN_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    overflow: 'hidden',
    position: 'relative',
  },
  bestSellerBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FDECEA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  bestSellerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#AC1D10',
  },
  menuImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#F9F9F9',
  },
  menuContent: {
    padding: 12,
  },
  menuTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 4,
  },
  menuPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#AC1D10',
  },
  menuDesc: {
    fontSize: 11,
    color: '#888',
    lineHeight: 16,
    marginBottom: 8,
  },
  menuBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemRatingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  itemReviews: {
    fontWeight: '400',
    color: '#888',
  },
  addButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#8E170C',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
