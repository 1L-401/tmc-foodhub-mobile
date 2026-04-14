import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

/* ─── Types ─── */
type StockStatus = 'available' | 'low_stock' | 'out_of_stock';
type Category = 'All Categories' | 'Burgers' | 'Main Courses' | 'Coffee' | 'Fries' | 'Desserts' | 'Drinks';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  status: StockStatus;
  available: boolean;
  image: string;
  price: number;
}

/* ─── Mock Inventory Data ─── */
const INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: '1',
    name: 'Double Cheese Burger',
    category: 'Burgers',
    stock: 5,
    status: 'low_stock',
    available: true,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&h=120&fit=crop',
    price: 7.00,
  },
  {
    id: '2',
    name: 'Grilled Steak',
    category: 'Main Courses',
    stock: 28,
    status: 'available',
    available: true,
    image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=120&h=120&fit=crop',
    price: 12.00,
  },
  {
    id: '3',
    name: 'Black Iced Coffee',
    category: 'Coffee',
    stock: 0,
    status: 'out_of_stock',
    available: false,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=120&h=120&fit=crop',
    price: 3.00,
  },
  {
    id: '4',
    name: 'Fries',
    category: 'Fries',
    stock: 18,
    status: 'available',
    available: true,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=120&h=120&fit=crop',
    price: 4.50,
  },
  {
    id: '5',
    name: 'Sushi',
    category: 'Main Courses',
    stock: 25,
    status: 'low_stock',
    available: true,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=120&h=120&fit=crop',
    price: 15.00,
  },
  {
    id: '6',
    name: 'Chocolate Cake',
    category: 'Desserts',
    stock: 12,
    status: 'available',
    available: true,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=120&h=120&fit=crop',
    price: 6.50,
  },
  {
    id: '7',
    name: 'Classic Burger',
    category: 'Burgers',
    stock: 0,
    status: 'out_of_stock',
    available: false,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=120&h=120&fit=crop',
    price: 8.50,
  },
  {
    id: '8',
    name: 'Iced Latte',
    category: 'Coffee',
    stock: 3,
    status: 'low_stock',
    available: true,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=120&h=120&fit=crop',
    price: 4.00,
  },
  {
    id: '9',
    name: 'Lemonade',
    category: 'Drinks',
    stock: 40,
    status: 'available',
    available: true,
    image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=120&h=120&fit=crop',
    price: 2.50,
  },
  {
    id: '10',
    name: 'Veggie Bowl Special',
    category: 'Main Courses',
    stock: 8,
    status: 'low_stock',
    available: true,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=120&h=120&fit=crop',
    price: 12.50,
  },
];

const CATEGORIES: Category[] = [
  'All Categories',
  'Burgers',
  'Main Courses',
  'Coffee',
  'Fries',
  'Desserts',
  'Drinks',
];

type StatusFilter = 'All' | 'available' | 'low_stock' | 'out_of_stock';
const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'All', label: 'All' },
  { key: 'available', label: 'Available' },
  { key: 'low_stock', label: 'Low Stock' },
  { key: 'out_of_stock', label: 'Out of Stock' },
];

/* ─── Status Badge ─── */
function StockBadge({ status }: { status: StockStatus }) {
  const cfg = {
    available: { color: '#047857', label: 'Available' },
    low_stock: { color: '#B45309', label: 'Low Stock' },
    out_of_stock: { color: '#DC2626', label: 'Out of Stock' },
  }[status];

  return <Text style={[badgeStyles.text, { color: cfg.color }]}>{cfg.label}</Text>;
}

/* ─── Stat Card ─── */
function StatCard({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  sublabel,
  index,
}: {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  value: number;
  sublabel: string;
  index: number;
}) {
  return (
    <Animated.View
      entering={FadeInRight.delay(200 + index * 80).duration(400)}
      style={statStyles.card}>
      <View style={[statStyles.iconWrap, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons
          name={icon as any}
          size={16}
          color={iconColor}
        />
      </View>
      <Text style={statStyles.label}>{label}</Text>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.sublabel}>{sublabel}</Text>
    </Animated.View>
  );
}

/* ─── Dropdown Button ─── */
function DropdownButton({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        filterStyles.dropdown,
        pressed && { opacity: 0.7 },
      ]}>
      <Text style={filterStyles.dropdownText} numberOfLines={1}>
        {value}
      </Text>
      <MaterialCommunityIcons name="chevron-down" size={16} color="#888" />
    </Pressable>
  );
}

/* ─── Inventory Item Card ─── */
function InventoryCard({
  item,
  index,
  onToggle,
}: {
  item: InventoryItem;
  index: number;
  onToggle: (id: string) => void;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(300 + index * 60).duration(400)}
      style={cardStyles.container}>
      {/* Top: image + info */}
      <View style={cardStyles.topRow}>
        <Image source={{ uri: item.image }} style={cardStyles.image} />
        <View style={cardStyles.info}>
          <View style={cardStyles.nameRow}>
            <Text style={cardStyles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={cardStyles.category}>{item.category}</Text>
          </View>
          <View style={cardStyles.stockRow}>
            <Text
              style={[
                cardStyles.stockCount,
                item.status === 'out_of_stock' && { color: '#DC2626' },
                item.status === 'low_stock' && { color: '#B45309' },
              ]}>
              {item.stock} units
            </Text>
            <StockBadge status={item.status} />
          </View>
        </View>
      </View>

      {/* Bottom: toggle + actions */}
      <View style={cardStyles.bottomRow}>
        <View style={cardStyles.toggleWrap}>
          <Switch
            value={item.available}
            onValueChange={() => onToggle(item.id)}
            trackColor={{ false: '#E5E5E5', true: '#FCDCD8' }}
            thumbColor={item.available ? '#AC1D10' : '#CCC'}
            ios_backgroundColor="#E5E5E5"
            style={Platform.OS === 'ios' ? { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] } : undefined}
          />
        </View>

        <View style={cardStyles.actions}>
          {item.status === 'out_of_stock' && (
            <Pressable
              style={({ pressed }) => [
                cardStyles.refillBtn,
                pressed && { opacity: 0.7 },
              ]}>
              <Text style={cardStyles.refillText}>Refill Now</Text>
            </Pressable>
          )}
          <Pressable
            style={({ pressed }) => [
              cardStyles.editBtn,
              pressed && { opacity: 0.7 },
            ]}>
            <MaterialCommunityIcons
              name="pencil-outline"
              size={18}
              color="#888"
            />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

/* ─── Main Screen ─── */
export default function InventoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All Categories');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('All');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [items, setItems] = useState(INVENTORY_ITEMS);

  // Stats
  const totalItems = items.length;
  const lowStockCount = items.filter((i) => i.status === 'low_stock').length;
  const outOfStockCount = items.filter((i) => i.status === 'out_of_stock').length;

  // Toggle availability
  const handleToggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, available: !item.available } : item,
      ),
    );
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    let result = items;

    if (selectedCategory !== 'All Categories') {
      result = result.filter((i) => i.category === selectedCategory);
    }

    if (selectedStatus !== 'All') {
      result = result.filter((i) => i.status === selectedStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q),
      );
    }

    return result;
  }, [items, selectedCategory, selectedStatus, searchQuery]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {/* ── Top Bar ── */}
        <Animated.View
          entering={FadeInDown.delay(50).duration(350)}
          style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [pressed && styles.pressed]}
            onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
          </Pressable>

          <View style={styles.logoWrap}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoText}>TMC</Text>
            </View>
            <Text style={styles.logoTitle}>
              FOOD{'\n'}
              <Text style={styles.logoBold}>HUB</Text>
            </Text>
          </View>

          <View style={styles.topBarRight}>
            <Pressable style={styles.avatarWrap}>
              <MaterialCommunityIcons
                name="account-circle"
                size={32}
                color="#AC1D10"
              />
            </Pressable>
          </View>
        </Animated.View>

        {/* ── Search ── */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={styles.searchWrap}>
          <MaterialCommunityIcons name="magnify" size={18} color="#AAA" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            placeholderTextColor="#AAA"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* ── Title ── */}
          <Animated.View entering={FadeInDown.delay(120).duration(400)}>
            <Text style={styles.pageTitle}>Inventory</Text>
            <Text style={styles.pageSubtitle}>
              Monitor stock levels to avoid shortages and update ingredient
              availability in real time.
            </Text>
          </Animated.View>

          {/* ── Stat Cards ── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsRow}>
            <StatCard
              icon="package-variant-closed"
              iconColor="#AC1D10"
              iconBg="#FBE7E4"
              label="Total Items"
              value={totalItems}
              sublabel={`+2 This week`}
              index={0}
            />
            <StatCard
              icon="alert-circle-outline"
              iconColor="#B45309"
              iconBg="#FEF3C7"
              label="Low Stock Alert"
              value={lowStockCount}
              sublabel="Needs replenishment"
              index={1}
            />
            <StatCard
              icon="close-circle-outline"
              iconColor="#DC2626"
              iconBg="#FEF2F2"
              label="Out of Stock"
              value={outOfStockCount}
              sublabel="Action required"
              index={2}
            />
          </ScrollView>

          {/* ── Filters Row ── */}
          <Animated.View
            entering={FadeInDown.delay(250).duration(400)}
            style={filterStyles.container}>
            {/* Category Dropdown */}
            <DropdownButton
              label="Category"
              value={selectedCategory}
              onPress={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setShowStatusDropdown(false);
              }}
            />

            {/* Status Dropdown */}
            <DropdownButton
              label="Status"
              value={selectedStatus === 'All' ? 'Status: All' : selectedStatus.replace('_', ' ')}
              onPress={() => {
                setShowStatusDropdown(!showStatusDropdown);
                setShowCategoryDropdown(false);
              }}
            />

            {/* Sort */}
            <Pressable
              style={({ pressed }) => [
                filterStyles.sortBtn,
                pressed && { opacity: 0.7 },
              ]}>
              <MaterialCommunityIcons name="sort-variant" size={14} color="#666" />
              <Text style={filterStyles.sortText}>Sort by</Text>
            </Pressable>

            {/* Export */}
            <Pressable
              style={({ pressed }) => [
                filterStyles.exportBtn,
                pressed && { opacity: 0.7 },
              ]}>
              <MaterialCommunityIcons name="download" size={14} color="#FFF" />
              <Text style={filterStyles.exportText}>Export</Text>
            </Pressable>
          </Animated.View>

          {/* ── Category Dropdown List ── */}
          {showCategoryDropdown && (
            <Animated.View
              entering={FadeInDown.duration(200)}
              style={dropdownStyles.list}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => {
                    setSelectedCategory(cat);
                    setShowCategoryDropdown(false);
                  }}
                  style={[
                    dropdownStyles.item,
                    selectedCategory === cat && dropdownStyles.itemActive,
                  ]}>
                  <Text
                    style={[
                      dropdownStyles.itemText,
                      selectedCategory === cat && dropdownStyles.itemTextActive,
                    ]}>
                    {cat}
                  </Text>
                  {selectedCategory === cat && (
                    <MaterialCommunityIcons name="check" size={16} color="#AC1D10" />
                  )}
                </Pressable>
              ))}
            </Animated.View>
          )}

          {/* ── Status Dropdown List ── */}
          {showStatusDropdown && (
            <Animated.View
              entering={FadeInDown.duration(200)}
              style={dropdownStyles.list}>
              {STATUS_FILTERS.map((s) => (
                <Pressable
                  key={s.key}
                  onPress={() => {
                    setSelectedStatus(s.key);
                    setShowStatusDropdown(false);
                  }}
                  style={[
                    dropdownStyles.item,
                    selectedStatus === s.key && dropdownStyles.itemActive,
                  ]}>
                  <Text
                    style={[
                      dropdownStyles.itemText,
                      selectedStatus === s.key && dropdownStyles.itemTextActive,
                    ]}>
                    {s.label}
                  </Text>
                  {selectedStatus === s.key && (
                    <MaterialCommunityIcons name="check" size={16} color="#AC1D10" />
                  )}
                </Pressable>
              ))}
            </Animated.View>
          )}

          {/* ── Inventory Items ── */}
          {filteredItems.length > 0 ? (
            filteredItems.map((item, i) => (
              <InventoryCard
                key={item.id}
                item={item}
                index={i}
                onToggle={handleToggle}
              />
            ))
          ) : (
            <Animated.View
              entering={FadeInDown.delay(300).duration(400)}
              style={styles.emptyState}>
              <MaterialCommunityIcons
                name="package-variant-remove"
                size={48}
                color="#CCC"
              />
              <Text style={styles.emptyTitle}>No items found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Try a different search term'
                  : 'No items match the selected filters'}
              </Text>
            </Animated.View>
          )}

          {/* Bottom spacer */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* ─── Styles ─── */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F8F8' },
  container: { flex: 1 },
  pressed: { opacity: 0.7 },

  /* Top Bar */
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
  logoTitle: {
    fontSize: 8,
    color: '#1A1A1A',
    fontWeight: '500',
    lineHeight: 10,
  },
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

  /* Search */
  searchWrap: {
    marginHorizontal: 16,
    marginBottom: 12,
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

  scrollContent: { paddingHorizontal: 16 },

  /* Page Header */
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
    marginBottom: 14,
    lineHeight: 18,
  },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    paddingRight: 8,
  },

  /* Empty State */
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#999',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#BBB',
  },
});

const statStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 12,
    minWidth: 130,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: { fontSize: 10, color: '#999', fontWeight: '500', marginBottom: 2 },
  value: { fontSize: 24, fontWeight: '800', color: '#1A1A1A', marginBottom: 2 },
  sublabel: { fontSize: 9, color: '#BBB', fontWeight: '500' },
});

const filterStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  dropdownText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
    maxWidth: 90,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  sortText: { fontSize: 12, color: '#666', fontWeight: '500' },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#AC1D10',
  },
  exportText: { fontSize: 12, color: '#FFF', fontWeight: '700' },
});

const dropdownStyles = StyleSheet.create({
  list: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  itemActive: {
    backgroundColor: '#FBE7E4',
  },
  itemText: { fontSize: 13, color: '#555', fontWeight: '500' },
  itemTextActive: { color: '#AC1D10', fontWeight: '700' },
});

const badgeStyles = StyleSheet.create({
  text: { fontSize: 12, fontWeight: '700' },
});

const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  image: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0F0F0',
  },
  info: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 8,
  },
  category: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stockCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 10,
  },
  toggleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refillBtn: {},
  refillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#AC1D10',
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
