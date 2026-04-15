import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
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

import {
  CATEGORY_OPTIONS,
  MENU_CATEGORIES,
  MENU_ITEMS,
  SORT_OPTIONS,
  type MenuCategory,
  type MenuItem,
  type SortOption,
  type StockStatus,
} from '@/constants/mock-menu-data';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 10;
const CARD_WIDTH = (SCREEN_WIDTH - 32 - CARD_GAP) / 2;

/* ══════════════════════════════════════════════
   Reusable Sub-Components
   ══════════════════════════════════════════════ */

/* ─── Stock Status Badge ─── */
function StockBadge({ status }: { status: StockStatus }) {
  const cfg = {
    Available: { bg: '#D1FAE5', text: '#047857', label: 'Available' },
    'Low Stock': { bg: '#FEF3C7', text: '#B45309', label: 'Low Stock' },
    'Out of Stock': { bg: '#FEE2E2', text: '#DC2626', label: 'Out of Stock' },
  }[status];

  return (
    <View style={[badgeStyles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[badgeStyles.text, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

/* ─── Best Seller Badge ─── */
function BestSellerBadge() {
  return (
    <View style={badgeStyles.bestSeller}>
      <Text style={badgeStyles.bestSellerText}>Best Seller</Text>
    </View>
  );
}

/* ─── Sort Dropdown ─── */
function SortDropdown({
  selected,
  onSelect,
}: {
  selected: SortOption;
  onSelect: (opt: SortOption) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ position: 'relative', zIndex: 10 }}>
      <Pressable
        style={dropdownStyles.trigger}
        onPress={() => setOpen(!open)}>
        <Text style={dropdownStyles.triggerText}>{selected}</Text>
        <MaterialCommunityIcons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#666"
        />
      </Pressable>

      {open && (
        <View style={dropdownStyles.menu}>
          {SORT_OPTIONS.map((opt) => (
            <Pressable
              key={opt}
              style={[
                dropdownStyles.menuItem,
                selected === opt && dropdownStyles.menuItemActive,
              ]}
              onPress={() => {
                onSelect(opt);
                setOpen(false);
              }}>
              <Text
                style={[
                  dropdownStyles.menuItemText,
                  selected === opt && dropdownStyles.menuItemTextActive,
                ]}>
                {opt}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

/* ─── Category Dropdown (for modals) ─── */
function CategoryDropdown({
  selected,
  onSelect,
}: {
  selected: MenuCategory;
  onSelect: (cat: MenuCategory) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ position: 'relative', zIndex: 10 }}>
      <Pressable
        style={formStyles.dropdownTrigger}
        onPress={() => setOpen(!open)}>
        <Text style={formStyles.dropdownText}>{selected}</Text>
        <MaterialCommunityIcons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#666"
        />
      </Pressable>

      {open && (
        <View style={formStyles.dropdownMenu}>
          {CATEGORY_OPTIONS.map((cat) => (
            <Pressable
              key={cat}
              style={[
                formStyles.dropdownItem,
                selected === cat && formStyles.dropdownItemActive,
              ]}
              onPress={() => {
                onSelect(cat);
                setOpen(false);
              }}>
              <Text
                style={[
                  formStyles.dropdownItemText,
                  selected === cat && formStyles.dropdownItemTextActive,
                ]}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

/* ─── Menu Item Card (Grid) ─── */
function MenuItemCard({
  item,
  index,
  onPress,
  onToggleAvailability,
}: {
  item: MenuItem;
  index: number;
  onPress: () => void;
  onToggleAvailability: (id: string, value: boolean) => void;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(200 + index * 60).duration(400)}
      style={[cardStyles.card, { width: CARD_WIDTH }]}>
      <Pressable onPress={onPress}>
        <View style={cardStyles.imageWrap}>
          <Image source={{ uri: item.image }} style={cardStyles.image} />
          {item.isBestSeller && (
            <View style={cardStyles.bestSellerWrap}>
              <BestSellerBadge />
            </View>
          )}
        </View>

        <View style={cardStyles.info}>
          <View style={cardStyles.nameRow}>
            <Text style={cardStyles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={cardStyles.price}>
              ${item.price.toFixed(2)}
            </Text>
          </View>
          <Text style={cardStyles.description} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </Pressable>

      <View style={cardStyles.bottomRow}>
        <StockBadge status={item.stockStatus} />
        <Switch
          value={item.isAvailable}
          onValueChange={(val) => onToggleAvailability(item.id, val)}
          trackColor={{ false: '#E5E5E5', true: '#AC1D10' }}
          thumbColor="#FFF"
          style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
        />
      </View>
    </Animated.View>
  );
}

/* ══════════════════════════════════════════════
   Modal: Item Detail View
   ══════════════════════════════════════════════ */
function ItemDetailModal({
  visible,
  item,
  onClose,
  onEditDetails,
  onDeleteItem,
  onToggleAutoOutOfStock,
  autoOutOfStock,
}: {
  visible: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onEditDetails: () => void;
  onDeleteItem: () => void;
  onToggleAutoOutOfStock: (val: boolean) => void;
  autoOutOfStock: boolean;
}) {
  if (!item) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.detailCard}>
          {/* Close X */}
          <Pressable style={modalStyles.closeX} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={20} color="#666" />
          </Pressable>

          {/* Image */}
          <Image source={{ uri: item.image }} style={modalStyles.detailImage} />

          {/* Best Seller */}
          {item.isBestSeller && (
            <View style={{ marginBottom: 8 }}>
              <BestSellerBadge />
            </View>
          )}

          {/* Name */}
          <Text style={modalStyles.detailName}>{item.name}</Text>

          {/* Meta row */}
          <View style={modalStyles.metaRow}>
            <Text style={modalStyles.detailPrice}>
              ${item.price.toFixed(2)}
            </Text>
            <Text style={modalStyles.metaDot}>•</Text>
            <MaterialCommunityIcons
              name="clock-outline"
              size={13}
              color="#666"
            />
            <Text style={modalStyles.metaText}>{item.prepTime}</Text>
            <Text style={modalStyles.metaDot}>•</Text>
            <MaterialCommunityIcons name="star" size={13} color="#F59E0B" />
            <Text style={modalStyles.metaText}>
              {item.rating} ({item.totalReviews.toLocaleString()})
            </Text>
            <Text style={modalStyles.metaDot}>•</Text>
            <StockBadge status={item.stockStatus} />
          </View>

          {/* Description */}
          <Text style={modalStyles.detailDescription}>
            {item.description}
          </Text>

          {/* Auto-toggle Out of Stock */}
          <View style={modalStyles.autoToggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={modalStyles.autoToggleTitle}>
                Auto-toggle 'Out of Stock'
              </Text>
              <Text style={modalStyles.autoToggleSubtitle}>
                Automatically hide from digital menu when stock reaches zero.
              </Text>
            </View>
            <Switch
              value={autoOutOfStock}
              onValueChange={onToggleAutoOutOfStock}
              trackColor={{ false: '#E5E5E5', true: '#1D4ED8' }}
              thumbColor="#FFF"
            />
          </View>

          {/* Action Buttons */}
          <View style={modalStyles.actionRow}>
            <Pressable
              style={({ pressed }) => [
                modalStyles.actionBtn,
                modalStyles.editBtn,
                pressed && { opacity: 0.8 },
              ]}
              onPress={onEditDetails}>
              <Text style={modalStyles.editBtnText}>Edit Details</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                modalStyles.actionBtn,
                modalStyles.deleteBtn,
                pressed && { opacity: 0.8 },
              ]}
              onPress={onDeleteItem}>
              <Text style={modalStyles.deleteBtnText}>Delete Item</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                modalStyles.actionBtn,
                modalStyles.closeBtn,
                pressed && { opacity: 0.8 },
              ]}
              onPress={onClose}>
              <Text style={modalStyles.closeBtnText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ══════════════════════════════════════════════
   Modal: Edit Product Details
   ══════════════════════════════════════════════ */
function EditItemModal({
  visible,
  item,
  onClose,
  onSave,
}: {
  visible: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onSave: (updated: Partial<MenuItem>) => void;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MenuCategory>('Main Courses');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  // Sync form with item when modal opens
  React.useEffect(() => {
    if (item && visible) {
      setName(item.name);
      setCategory(item.category as MenuCategory);
      setDescription(item.description);
      setPrice(item.price.toFixed(2));
      setPrepTime(item.prepTime);
      setIsAvailable(item.isAvailable);
    }
  }, [item, visible]);

  const handleSave = () => {
    onSave({
      name,
      category,
      description,
      price: parseFloat(price) || 0,
      prepTime,
      isAvailable,
    });
    Alert.alert('Success', 'Product details have been updated.', [
      { text: 'OK', onPress: onClose },
    ]);
  };

  if (!item) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.formCard}>
          {/* Header */}
          <View style={formStyles.header}>
            <Text style={formStyles.headerTitle}>Edit Product Details</Text>
            <Pressable onPress={onClose}>
              <MaterialCommunityIcons name="close" size={20} color="#666" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Image + Name + Category row */}
            <View style={formStyles.topRow}>
              <Image
                source={{ uri: item.image }}
                style={formStyles.thumbnail}
              />
              <View style={{ flex: 1, gap: 8 }}>
                <View>
                  <Text style={formStyles.label}>Item Name</Text>
                  <TextInput
                    style={formStyles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Item Name"
                    placeholderTextColor="#AAA"
                  />
                </View>
                <View style={{ zIndex: 10 }}>
                  <Text style={formStyles.label}>Category</Text>
                  <CategoryDropdown
                    selected={category}
                    onSelect={setCategory}
                  />
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={{ marginTop: 12 }}>
              <Text style={formStyles.label}>Description</Text>
              <TextInput
                style={[formStyles.input, formStyles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Write the description..."
                placeholderTextColor="#AAA"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Price + Prep Time */}
            <View style={formStyles.rowFields}>
              <View style={{ flex: 1 }}>
                <Text style={formStyles.label}>Price</Text>
                <View style={formStyles.priceWrap}>
                  <Text style={formStyles.currencySymbol}>₱</Text>
                  <TextInput
                    style={[formStyles.input, { flex: 1, borderWidth: 0 }]}
                    value={price}
                    onChangeText={setPrice}
                    placeholder="0.00"
                    placeholderTextColor="#AAA"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={formStyles.label}>Estimated Prep Time (mins)</Text>
                <View style={formStyles.priceWrap}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={14}
                    color="#999"
                  />
                  <TextInput
                    style={[formStyles.input, { flex: 1, borderWidth: 0 }]}
                    value={prepTime}
                    onChangeText={setPrepTime}
                    placeholder="20-25 mins"
                    placeholderTextColor="#AAA"
                  />
                </View>
              </View>
            </View>

            {/* Item Availability */}
            <View style={formStyles.availabilityRow}>
              <View style={{ flex: 1 }}>
                <Text style={formStyles.availabilityTitle}>
                  Item Availability
                </Text>
                <Text style={formStyles.availabilitySubtitle}>
                  Enable this to show the item in the customer menu.
                </Text>
              </View>
              <Switch
                value={isAvailable}
                onValueChange={setIsAvailable}
                trackColor={{ false: '#E5E5E5', true: '#1D4ED8' }}
                thumbColor="#FFF"
              />
            </View>

            {/* Buttons */}
            <View style={formStyles.buttonRow}>
              <Pressable
                style={({ pressed }) => [
                  formStyles.cancelBtn,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={onClose}>
                <Text style={formStyles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  formStyles.saveBtn,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={handleSave}>
                <Text style={formStyles.saveBtnText}>Save Changes</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ══════════════════════════════════════════════
   Modal: Add New Item
   ══════════════════════════════════════════════ */
function AddItemModal({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (newItem: Partial<MenuItem>) => void;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MenuCategory>('Main Courses');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  const resetForm = () => {
    setName('');
    setCategory('Main Courses');
    setDescription('');
    setPrice('');
    setPrepTime('');
    setIsAvailable(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter an item name.');
      return;
    }
    if (!price.trim() || isNaN(parseFloat(price))) {
      Alert.alert('Validation', 'Please enter a valid price.');
      return;
    }

    onSave({
      name,
      category,
      description,
      price: parseFloat(price),
      prepTime: prepTime || '15-20 mins',
      isAvailable,
    });

    Alert.alert('Success', `"${name}" has been added to the menu.`, [
      {
        text: 'OK',
        onPress: () => {
          resetForm();
          onClose();
        },
      },
    ]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.formCard}>
          {/* Header */}
          <View style={formStyles.header}>
            <Text style={formStyles.headerTitle}>Add New Item</Text>
            <Pressable onPress={handleClose}>
              <MaterialCommunityIcons name="close" size={20} color="#666" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Photo upload placeholder + fields */}
            <View style={formStyles.topRow}>
              <Pressable
                style={formStyles.photoUpload}
                onPress={() =>
                  Alert.alert(
                    'Upload Photo',
                    'Camera / Gallery picker will be available when connected to backend.',
                  )
                }>
                <MaterialCommunityIcons
                  name="camera-outline"
                  size={28}
                  color="#BBB"
                />
                <Text style={formStyles.photoUploadText}>Add Photo</Text>
              </Pressable>

              <View style={{ flex: 1, gap: 8 }}>
                <View>
                  <Text style={formStyles.label}>Item Name</Text>
                  <TextInput
                    style={formStyles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Item Name"
                    placeholderTextColor="#AAA"
                  />
                </View>
                <View style={{ zIndex: 10 }}>
                  <Text style={formStyles.label}>Category</Text>
                  <CategoryDropdown
                    selected={category}
                    onSelect={setCategory}
                  />
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={{ marginTop: 12 }}>
              <Text style={formStyles.label}>Description</Text>
              <TextInput
                style={[formStyles.input, formStyles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Write the description..."
                placeholderTextColor="#AAA"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Price + Prep Time */}
            <View style={formStyles.rowFields}>
              <View style={{ flex: 1 }}>
                <Text style={formStyles.label}>Price</Text>
                <View style={formStyles.priceWrap}>
                  <Text style={formStyles.currencySymbol}>₱</Text>
                  <TextInput
                    style={[formStyles.input, { flex: 1, borderWidth: 0 }]}
                    value={price}
                    onChangeText={setPrice}
                    placeholder="0.00"
                    placeholderTextColor="#AAA"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={formStyles.label}>Estimated Prep Time (mins)</Text>
                <View style={formStyles.priceWrap}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={14}
                    color="#999"
                  />
                  <TextInput
                    style={[formStyles.input, { flex: 1, borderWidth: 0 }]}
                    value={prepTime}
                    onChangeText={setPrepTime}
                    placeholder="0"
                    placeholderTextColor="#AAA"
                  />
                </View>
              </View>
            </View>

            {/* Item Availability */}
            <View style={formStyles.availabilityRow}>
              <View style={{ flex: 1 }}>
                <Text style={formStyles.availabilityTitle}>
                  Item Availability
                </Text>
                <Text style={formStyles.availabilitySubtitle}>
                  Enable this to show the item in the customer menu.
                </Text>
              </View>
              <Switch
                value={isAvailable}
                onValueChange={setIsAvailable}
                trackColor={{ false: '#E5E5E5', true: '#1D4ED8' }}
                thumbColor="#FFF"
              />
            </View>

            {/* Buttons */}
            <View style={formStyles.buttonRow}>
              <Pressable
                style={({ pressed }) => [
                  formStyles.cancelBtn,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={handleClose}>
                <Text style={formStyles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  formStyles.saveBtn,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={handleSave}>
                <Text style={formStyles.saveBtnText}>Save Item</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ══════════════════════════════════════════════
   Main Screen: Menu Management
   ══════════════════════════════════════════════ */
export default function MenuManagementScreen() {
  /* ─── State ─── */
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [activeCategory, setActiveCategory] =
    useState<MenuCategory>('All Items');
  const [sortBy, setSortBy] = useState<SortOption>('Popularity');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal states
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [autoOutOfStock, setAutoOutOfStock] = useState(true);

  /* ─── Computed ─── */
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All Items': menuItems.length };
    menuItems.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    let result = [...menuItems];

    // Category filter
    if (activeCategory !== 'All Items') {
      result = result.filter((item) => item.category === activeCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q),
      );
    }

    // Sort
    switch (sortBy) {
      case 'Price: Low to High':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'Price: High to Low':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'Name A-Z':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Popularity':
      default:
        result.sort((a, b) => b.totalReviews - a.totalReviews);
        break;
    }

    return result;
  }, [menuItems, activeCategory, searchQuery, sortBy]);

  /* ─── Handlers ─── */
  const handleToggleAvailability = useCallback(
    (id: string, value: boolean) => {
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                isAvailable: value,
                stockStatus: value
                  ? item.stockStatus === 'Out of Stock'
                    ? 'Available'
                    : item.stockStatus
                  : 'Out of Stock',
              }
            : item,
        ),
      );
    },
    [],
  );

  const handleOpenDetail = useCallback((item: MenuItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  }, []);

  const handleEditDetails = useCallback(() => {
    setShowDetailModal(false);
    setTimeout(() => setShowEditModal(true), 300);
  }, []);

  const handleDeleteItem = useCallback(() => {
    if (!selectedItem) return;
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${selectedItem.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setMenuItems((prev) =>
              prev.filter((item) => item.id !== selectedItem.id),
            );
            setShowDetailModal(false);
            setSelectedItem(null);
          },
        },
      ],
    );
  }, [selectedItem]);

  const handleSaveEdit = useCallback(
    (updated: Partial<MenuItem>) => {
      if (!selectedItem) return;
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id ? { ...item, ...updated } : item,
        ),
      );
    },
    [selectedItem],
  );

  const handleAddItem = useCallback((newItem: Partial<MenuItem>) => {
    const id = Date.now().toString();
    const fullItem: MenuItem = {
      id,
      name: newItem.name || 'New Item',
      description: newItem.description || '',
      price: newItem.price || 0,
      category: (newItem.category as MenuCategory) || 'Main Courses',
      image:
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop',
      isAvailable: newItem.isAvailable ?? true,
      isBestSeller: false,
      stockStatus: 'Available',
      rating: 0,
      totalReviews: 0,
      prepTime: newItem.prepTime || '15-20 mins',
    };
    setMenuItems((prev) => [fullItem, ...prev]);
  }, []);

  /* ─── Render ─── */
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {/* ── Top Bar ── */}
        <Animated.View
          entering={FadeInDown.delay(50).duration(400)}
          style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [pressed && styles.pressed]}
            onPress={() => router.push('/more')}>
            <MaterialCommunityIcons name="menu" size={24} color="#1A1A1A" />
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
          <Animated.View entering={FadeInDown.delay(150).duration(400)}>
            <Text style={styles.pageTitle}>Menu Management</Text>
            <Text style={styles.pageSubtitle}>
              Add, edit, or remove dishes and update descriptions, prices, and
              availability.
            </Text>
          </Animated.View>

          {/* ── Category Filter Tabs ── */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}>
              {MENU_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.key;
                const count = categoryCounts[cat.key] || 0;
                return (
                  <Pressable
                    key={cat.key}
                    onPress={() => setActiveCategory(cat.key)}
                    style={[
                      styles.filterTab,
                      isActive && styles.filterTabActive,
                    ]}>
                    <Text
                      style={[
                        styles.filterText,
                        isActive && styles.filterTextActive,
                      ]}>
                      {cat.label}
                    </Text>
                    <View
                      style={[
                        styles.filterBadge,
                        isActive && styles.filterBadgeActive,
                      ]}>
                      <Text
                        style={[
                          styles.filterBadgeText,
                          isActive && styles.filterBadgeTextActive,
                        ]}>
                        {count}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* ── Sort + View Toggle + Add Button ── */}
          <Animated.View
            entering={FadeInDown.delay(250).duration(400)}
            style={styles.toolbarRow}>
            <View style={styles.toolbarLeft}>
              <SortDropdown selected={sortBy} onSelect={setSortBy} />
              <View style={styles.viewToggle}>
                <Pressable
                  style={[
                    styles.viewToggleBtn,
                    viewMode === 'grid' && styles.viewToggleBtnActive,
                  ]}
                  onPress={() => setViewMode('grid')}>
                  <MaterialCommunityIcons
                    name="view-grid"
                    size={16}
                    color={viewMode === 'grid' ? '#AC1D10' : '#999'}
                  />
                </Pressable>
                <Pressable
                  style={[
                    styles.viewToggleBtn,
                    viewMode === 'list' && styles.viewToggleBtnActive,
                  ]}
                  onPress={() => setViewMode('list')}>
                  <MaterialCommunityIcons
                    name="view-list"
                    size={16}
                    color={viewMode === 'list' ? '#AC1D10' : '#999'}
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.addBtn,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => setShowAddModal(true)}>
              <MaterialCommunityIcons name="plus" size={16} color="#FFF" />
              <Text style={styles.addBtnText}>Add New Item</Text>
            </Pressable>
          </Animated.View>

          {/* ── Menu Grid / List ── */}
          {filteredItems.length > 0 ? (
            viewMode === 'grid' ? (
              <View style={styles.grid}>
                {filteredItems.reduce<MenuItem[][]>((rows, item, i) => {
                  if (i % 2 === 0) rows.push([item]);
                  else rows[rows.length - 1].push(item);
                  return rows;
                }, []).map((row, rowIdx) => (
                  <View key={rowIdx} style={styles.gridRow}>
                    {row.map((item, colIdx) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        index={rowIdx * 2 + colIdx}
                        onPress={() => handleOpenDetail(item)}
                        onToggleAvailability={handleToggleAvailability}
                      />
                    ))}
                    {row.length === 1 && <View style={{ width: CARD_WIDTH }} />}
                  </View>
                ))}
              </View>
            ) : (
              <View>
                {filteredItems.map((item, i) => (
                  <Animated.View
                    key={item.id}
                    entering={FadeInRight.delay(200 + i * 60).duration(400)}>
                    <Pressable
                      style={styles.listItem}
                      onPress={() => handleOpenDetail(item)}>
                      <Image
                        source={{ uri: item.image }}
                        style={styles.listImage}
                      />
                      <View style={styles.listInfo}>
                        <Text style={styles.listName}>{item.name}</Text>
                        <Text
                          style={styles.listDescription}
                          numberOfLines={1}>
                          {item.description}
                        </Text>
                        <View style={styles.listBottom}>
                          <Text style={styles.listPrice}>
                            ${item.price.toFixed(2)}
                          </Text>
                          <StockBadge status={item.stockStatus} />
                        </View>
                      </View>
                      <Switch
                        value={item.isAvailable}
                        onValueChange={(val) =>
                          handleToggleAvailability(item.id, val)
                        }
                        trackColor={{ false: '#E5E5E5', true: '#AC1D10' }}
                        thumbColor="#FFF"
                        style={{
                          transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }],
                        }}
                      />
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            )
          ) : (
            <Animated.View
              entering={FadeInDown.delay(300).duration(400)}
              style={styles.emptyState}>
              <MaterialCommunityIcons
                name="food-off"
                size={48}
                color="#CCC"
              />
              <Text style={styles.emptyTitle}>No menu items found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Try a different search term'
                  : 'No items match this filter'}
              </Text>
            </Animated.View>
          )}

          {/* Bottom spacer for tab bar */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* ── Modals ── */}
      <ItemDetailModal
        visible={showDetailModal}
        item={selectedItem}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedItem(null);
        }}
        onEditDetails={handleEditDetails}
        onDeleteItem={handleDeleteItem}
        onToggleAutoOutOfStock={setAutoOutOfStock}
        autoOutOfStock={autoOutOfStock}
      />

      <EditItemModal
        visible={showEditModal}
        item={selectedItem}
        onClose={() => {
          setShowEditModal(false);
          setSelectedItem(null);
        }}
        onSave={handleSaveEdit}
      />

      <AddItemModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddItem}
      />
    </SafeAreaView>
  );
}

/* ══════════════════════════════════════════════
   Styles
   ══════════════════════════════════════════════ */
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
  pageTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  pageSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
    marginBottom: 14,
    lineHeight: 18,
  },

  /* Filter Tabs */
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    paddingRight: 16,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  filterTabActive: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  filterText: { fontSize: 13, fontWeight: '600', color: '#666' },
  filterTextActive: { color: '#FFF' },
  filterBadge: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeActive: { backgroundColor: '#FFF' },
  filterBadgeText: { fontSize: 11, fontWeight: '700', color: '#999' },
  filterBadgeTextActive: { color: '#1A1A1A' },

  /* Toolbar */
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    zIndex: 10,
  },
  toolbarLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  viewToggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  viewToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#FFF',
  },
  viewToggleBtnActive: { backgroundColor: '#FBE7E4' },

  /* Add Button */
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#AC1D10',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addBtnText: { fontSize: 12, fontWeight: '700', color: '#FFF' },

  /* Grid */
  grid: {
    gap: CARD_GAP,
  },
  gridRow: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },

  /* List View */
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 10,
  },
  listImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
  },
  listInfo: { flex: 1 },
  listName: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  listDescription: { fontSize: 11, color: '#999', marginTop: 2 },
  listBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  listPrice: { fontSize: 14, fontWeight: '800', color: '#1A1A1A' },

  /* Empty State */
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#999' },
  emptySubtitle: { fontSize: 13, color: '#BBB' },
});

/* ─── Card Styles ─── */
const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  imageWrap: { position: 'relative' },
  image: {
    width: '100%',
    height: 100,
    backgroundColor: '#F0F0F0',
  },
  bestSellerWrap: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  info: { padding: 8 },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 2,
  },
  name: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  price: { fontSize: 11, fontWeight: '800', color: '#1A1A1A' },
  description: { fontSize: 9, color: '#999', marginTop: 2, lineHeight: 13 },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 6,
  },
});

/* ─── Badge Styles ─── */
const badgeStyles = StyleSheet.create({
  badge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  text: { fontSize: 9, fontWeight: '700' },
  bestSeller: {
    backgroundColor: '#AC1D10',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  bestSellerText: { fontSize: 9, fontWeight: '700', color: '#FFF' },
});

/* ─── Dropdown Styles ─── */
const dropdownStyles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFF',
  },
  triggerText: { fontSize: 12, fontWeight: '600', color: '#555' },
  menu: {
    position: 'absolute',
    top: 36,
    left: 0,
    right: 0,
    minWidth: 160,
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingVertical: 4,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    zIndex: 100,
  },
  menuItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  menuItemActive: { backgroundColor: '#FBE7E4' },
  menuItemText: { fontSize: 13, color: '#555' },
  menuItemTextActive: { color: '#AC1D10', fontWeight: '600' },
});

/* ─── Modal Styles ─── */
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  /* Detail Modal */
  detailCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    width: '100%',
    maxWidth: 360,
    padding: 20,
    alignItems: 'center',
  },
  closeX: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 10,
    padding: 4,
  },
  detailImage: {
    width: 180,
    height: 140,
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: '#F0F0F0',
  },
  detailName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 12,
    justifyContent: 'center',
  },
  detailPrice: { fontSize: 16, fontWeight: '800', color: '#AC1D10' },
  metaDot: { fontSize: 10, color: '#CCC' },
  metaText: { fontSize: 11, color: '#666' },
  detailDescription: {
    fontSize: 13,
    color: '#555',
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 16,
  },

  autoToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    width: '100%',
    gap: 8,
  },
  autoToggleTitle: { fontSize: 12, fontWeight: '700', color: '#1A1A1A' },
  autoToggleSubtitle: { fontSize: 10, color: '#B45309', marginTop: 2 },

  actionRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  actionBtn: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: { backgroundColor: '#AC1D10' },
  editBtnText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  deleteBtn: { borderWidth: 1.5, borderColor: '#AC1D10', backgroundColor: '#FFF' },
  deleteBtnText: { fontSize: 12, fontWeight: '700', color: '#AC1D10' },
  closeBtn: { borderWidth: 1.5, borderColor: '#E5E5E5', backgroundColor: '#FFF' },
  closeBtnText: { fontSize: 12, fontWeight: '700', color: '#666' },

  /* Form Modal */
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    width: '100%',
    maxWidth: 360,
    padding: 20,
    maxHeight: '85%',
  },
});

/* ─── Form Styles ─── */
const formStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },

  topRow: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  photoUpload: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  photoUploadText: { fontSize: 10, color: '#AAA', fontWeight: '500' },

  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 10 : 7,
    fontSize: 13,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  rowFields: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  priceWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#FAFAFA',
    gap: 4,
  },
  currencySymbol: { fontSize: 14, fontWeight: '700', color: '#999' },

  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 10 : 7,
    backgroundColor: '#FAFAFA',
  },
  dropdownText: { fontSize: 13, color: '#1A1A1A' },
  dropdownMenu: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingVertical: 4,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    zIndex: 100,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dropdownItemActive: { backgroundColor: '#FBE7E4' },
  dropdownItemText: { fontSize: 13, color: '#555' },
  dropdownItemTextActive: { color: '#AC1D10', fontWeight: '600' },

  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    gap: 8,
  },
  availabilityTitle: { fontSize: 12, fontWeight: '700', color: '#1D4ED8' },
  availabilitySubtitle: { fontSize: 10, color: '#3B82F6', marginTop: 2 },

  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    marginBottom: 8,
    justifyContent: 'center',
  },
  cancelBtn: {
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  cancelBtnText: { fontSize: 13, fontWeight: '700', color: '#666' },
  saveBtn: {
    backgroundColor: '#AC1D10',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  saveBtnText: { fontSize: 13, fontWeight: '700', color: '#FFF' },
});
