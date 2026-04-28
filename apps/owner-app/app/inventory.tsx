import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomToggle } from '@/components/custom-toggle';
import {
  createInventoryItem,
  deleteInventoryItem,
  fetchInventoryCategories,
  fetchInventoryItems,
  inventoryQueryKeys,
  updateInventoryItem,
  updateInventoryItemAvailability,
  updateInventoryItemStock,
  type InventoryCategory,
  type InventoryMenuItem,
  type InventoryMenuItemInput,
} from '@/services/inventoryService';

/* ─── Types ─── */
type StockStatus = 'available' | 'low_stock' | 'out_of_stock';
type StatusFilter = 'All' | StockStatus;
type CategoryOption = { id: number | 'all'; name: string };

type InventoryDisplayItem = InventoryMenuItem & {
  displayName: string;
  displayCategory: string;
  displayStock: number;
  displayStatus: StockStatus;
};

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'All', label: 'All' },
  { key: 'available', label: 'Available' },
  { key: 'low_stock', label: 'Low Stock' },
  { key: 'out_of_stock', label: 'Out of Stock' },
];

const DEFAULT_LOW_STOCK_THRESHOLD = 5;

const resolveStockStatus = (item: InventoryMenuItem): StockStatus => {
  const stockLevel = item.stock_level ?? 0;
  if (stockLevel <= 0) {
    return 'out_of_stock';
  }

  const threshold = item.min_threshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
  if (threshold > 0 && stockLevel <= threshold) {
    return 'low_stock';
  }

  return 'available';
};

const resolveCategoryName = (
  item: InventoryMenuItem,
  categoryNameById: Map<number, string>,
) => {
  if (item.category?.name) {
    return item.category.name;
  }

  if (item.category_id != null) {
    return categoryNameById.get(item.category_id) ?? 'Uncategorized';
  }

  return 'Uncategorized';
};

const toDisplayItem = (
  item: InventoryMenuItem,
  categoryNameById: Map<number, string>,
): InventoryDisplayItem => ({
  ...item,
  displayName: item.title || 'Untitled item',
  displayCategory: resolveCategoryName(item, categoryNameById),
  displayStock: item.stock_level ?? 0,
  displayStatus: resolveStockStatus(item),
});

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

/* ─── Stock Update Modal ─── */
function StockUpdateModal({
  visible,
  item,
  onClose,
  onSave,
  isSaving,
}: {
  visible: boolean;
  item: InventoryMenuItem | null;
  onClose: () => void;
  onSave: (stockLevel: number) => void;
  isSaving: boolean;
}) {
  const [stockLevel, setStockLevel] = useState('0');

  useEffect(() => {
    if (visible && item) {
      setStockLevel(String(item.stock_level ?? 0));
    }
  }, [item, visible]);

  if (!item) {
    return null;
  }

  const handleSave = () => {
    const parsedStock = Number(stockLevel);
    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
      Alert.alert('Validation', 'Please enter a valid stock level.');
      return;
    }

    onSave(parsedStock);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={stockModalStyles.overlay}>
        <View style={stockModalStyles.card}>
          <View style={stockModalStyles.header}>
            <Text style={stockModalStyles.headerTitle}>Update Stock</Text>
            <Pressable onPress={onClose}>
              <MaterialCommunityIcons name="close" size={20} color="#666" />
            </Pressable>
          </View>

          <Text style={stockModalStyles.subtitle}>{item.title}</Text>

          <View style={stockModalStyles.field}>
            <Text style={stockModalStyles.label}>Stock Level</Text>
            <TextInput
              style={stockModalStyles.input}
              value={stockLevel}
              onChangeText={setStockLevel}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor="#AAA"
            />
          </View>

          <View style={stockModalStyles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                stockModalStyles.cancelBtn,
                pressed && { opacity: 0.7 },
              ]}
              onPress={onClose}
              disabled={isSaving}>
              <Text style={stockModalStyles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                stockModalStyles.saveBtn,
                pressed && { opacity: 0.8 },
                isSaving && { opacity: 0.6 },
              ]}
              onPress={handleSave}
              disabled={isSaving}>
              <Text style={stockModalStyles.saveBtnText}>
                {isSaving ? 'Saving...' : 'Update'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ─── Item Form Modal ─── */
function ItemFormModal({
  visible,
  item,
  categories,
  onClose,
  onSubmit,
  isSaving,
}: {
  visible: boolean;
  item: InventoryMenuItem | null;
  categories: InventoryCategory[];
  onClose: () => void;
  onSubmit: (payload: InventoryMenuItemInput) => void;
  isSaving: boolean;
}) {
  const isEdit = Boolean(item);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [stockLevel, setStockLevel] = useState('0');
  const [minThreshold, setMinThreshold] = useState(String(DEFAULT_LOW_STOCK_THRESHOLD));
  const [unit, setUnit] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [autoToggle, setAutoToggle] = useState(true);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    if (!visible) {
      setShowCategoryList(false);
      return;
    }

    if (item) {
      setTitle(item.title ?? '');
      setPrice(item.price != null ? String(item.price) : '');
      setStockLevel(String(item.stock_level ?? 0));
      setMinThreshold(item.min_threshold != null ? String(item.min_threshold) : '');
      setUnit(item.unit ?? '');
      setDescription(item.description ?? '');
      setImage(item.image ?? '');
      setCategoryId(item.category?.id ?? item.category_id ?? null);
      setAutoToggle(Boolean(item.auto_toggle));
      setAvailable(Boolean(item.available));
      return;
    }

    setTitle('');
    setPrice('');
    setStockLevel('0');
    setMinThreshold(String(DEFAULT_LOW_STOCK_THRESHOLD));
    setUnit('');
    setDescription('');
    setImage('');
    setCategoryId(null);
    setAutoToggle(true);
    setAvailable(true);
  }, [item, visible]);

  const selectedCategoryLabel = useMemo(() => {
    if (categoryId == null) {
      return 'Uncategorized';
    }

    return categories.find((cat) => cat.id === categoryId)?.name ?? 'Uncategorized';
  }, [categories, categoryId]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Please enter an item name.');
      return;
    }

    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('Validation', 'Please enter a valid price.');
      return;
    }

    const parsedStock = Number(stockLevel);
    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
      Alert.alert('Validation', 'Please enter a valid stock level.');
      return;
    }

    const parsedThreshold = minThreshold.trim()
      ? Number(minThreshold)
      : null;

    if (parsedThreshold != null && (!Number.isFinite(parsedThreshold) || parsedThreshold < 0)) {
      Alert.alert('Validation', 'Please enter a valid low stock threshold.');
      return;
    }

    const payload: InventoryMenuItemInput = {
      title: title.trim(),
      price: parsedPrice,
      category_id: categoryId,
      description: description.trim() || null,
      image: image.trim() || null,
      stock_level: parsedStock,
      min_threshold: parsedThreshold,
      unit: unit.trim() || null,
      auto_toggle: autoToggle,
    };

    if (!autoToggle) {
      payload.available = available;
    }

    onSubmit(payload);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={itemModalStyles.overlay}>
        <View style={itemModalStyles.card}>
          <View style={itemModalStyles.header}>
            <Text style={itemModalStyles.headerTitle}>
              {isEdit ? 'Edit Item' : 'Create Item'}
            </Text>
            <Pressable onPress={onClose}>
              <MaterialCommunityIcons name="close" size={20} color="#666" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={itemModalStyles.field}>
              <Text style={itemModalStyles.label}>Item Name</Text>
              <TextInput
                style={itemModalStyles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Grilled Steak"
                placeholderTextColor="#AAA"
              />
            </View>

            <View style={itemModalStyles.row}>
              <View style={itemModalStyles.rowField}>
                <Text style={itemModalStyles.label}>Price</Text>
                <TextInput
                  style={itemModalStyles.input}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="#AAA"
                />
              </View>
              <View style={itemModalStyles.rowField}>
                <Text style={itemModalStyles.label}>Stock Level</Text>
                <TextInput
                  style={itemModalStyles.input}
                  value={stockLevel}
                  onChangeText={setStockLevel}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor="#AAA"
                />
              </View>
            </View>

            <View style={itemModalStyles.row}>
              <View style={itemModalStyles.rowField}>
                <Text style={itemModalStyles.label}>Low Stock Threshold</Text>
                <TextInput
                  style={itemModalStyles.input}
                  value={minThreshold}
                  onChangeText={setMinThreshold}
                  keyboardType="number-pad"
                  placeholder="5"
                  placeholderTextColor="#AAA"
                />
              </View>
              <View style={itemModalStyles.rowField}>
                <Text style={itemModalStyles.label}>Unit (Optional)</Text>
                <TextInput
                  style={itemModalStyles.input}
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="e.g., plate"
                  placeholderTextColor="#AAA"
                />
              </View>
            </View>

            <View style={itemModalStyles.field}>
              <Text style={itemModalStyles.label}>Category</Text>
              <Pressable
                onPress={() => setShowCategoryList((prev) => !prev)}
                style={({ pressed }) => [
                  itemModalStyles.dropdown,
                  pressed && { opacity: 0.7 },
                ]}>
                <Text style={itemModalStyles.dropdownText}>
                  {selectedCategoryLabel}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={16} color="#888" />
              </Pressable>
              {showCategoryList && (
                <View style={itemModalStyles.dropdownList}>
                  <Pressable
                    onPress={() => {
                      setCategoryId(null);
                      setShowCategoryList(false);
                    }}
                    style={itemModalStyles.dropdownItem}>
                    <Text style={itemModalStyles.dropdownItemText}>
                      Uncategorized
                    </Text>
                  </Pressable>
                  {categories.map((cat) => (
                    <Pressable
                      key={cat.id}
                      onPress={() => {
                        setCategoryId(cat.id);
                        setShowCategoryList(false);
                      }}
                      style={itemModalStyles.dropdownItem}>
                      <Text style={itemModalStyles.dropdownItemText}>{cat.name}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <View style={itemModalStyles.field}>
              <Text style={itemModalStyles.label}>Image URL (Optional)</Text>
              <TextInput
                style={itemModalStyles.input}
                value={image}
                onChangeText={setImage}
                placeholder="https://..."
                placeholderTextColor="#AAA"
              />
            </View>

            <View style={itemModalStyles.field}>
              <Text style={itemModalStyles.label}>Description (Optional)</Text>
              <TextInput
                style={[itemModalStyles.input, itemModalStyles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add details about the item"
                placeholderTextColor="#AAA"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={itemModalStyles.switchRow}>
              <Text style={itemModalStyles.label}>Auto Toggle Availability</Text>
              <CustomToggle
                value={autoToggle}
                onValueChange={setAutoToggle}
                size="small"
              />
            </View>

            {!autoToggle && (
              <View style={itemModalStyles.switchRow}>
                <Text style={itemModalStyles.label}>Available</Text>
                <CustomToggle
                  value={available}
                  onValueChange={setAvailable}
                  size="small"
                />
              </View>
            )}

            <View style={itemModalStyles.buttonRow}>
              <Pressable
                style={({ pressed }) => [
                  itemModalStyles.cancelBtn,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={onClose}
                disabled={isSaving}>
                <Text style={itemModalStyles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  itemModalStyles.saveBtn,
                  pressed && { opacity: 0.8 },
                  isSaving && { opacity: 0.6 },
                ]}
                onPress={handleSave}
                disabled={isSaving}>
                <Text style={itemModalStyles.saveBtnText}>
                  {isSaving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Item'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ─── Inventory Item Card ─── */
function InventoryCard({
  item,
  index,
  onToggle,
  onEdit,
  onDelete,
  onRefill,
}: {
  item: InventoryDisplayItem;
  index: number;
  onToggle: (item: InventoryDisplayItem, nextValue: boolean) => void;
  onEdit: (item: InventoryDisplayItem) => void;
  onDelete: (item: InventoryDisplayItem) => void;
  onRefill: (item: InventoryDisplayItem) => void;
}) {
  const imageUri = item.image ?? '';

  return (
    <Animated.View
      entering={FadeInDown.delay(300 + index * 60).duration(400)}
      style={cardStyles.container}>
      {/* Top: image + info */}
      <View style={cardStyles.topRow}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={cardStyles.image} />
        ) : (
          <View style={cardStyles.imagePlaceholder}>
            <MaterialCommunityIcons
              name="image-outline"
              size={22}
              color="#BBB"
            />
          </View>
        )}
        <View style={cardStyles.info}>
          <View style={cardStyles.nameRow}>
            <Text style={cardStyles.name} numberOfLines={1}>
              {item.displayName}
            </Text>
            <Text style={cardStyles.category}>{item.displayCategory}</Text>
          </View>
          <View style={cardStyles.stockRow}>
            <Text
              style={[
                cardStyles.stockCount,
                item.displayStatus === 'out_of_stock' && { color: '#DC2626' },
                item.displayStatus === 'low_stock' && { color: '#B45309' },
              ]}>
              {item.displayStock} units
            </Text>
            <StockBadge status={item.displayStatus} />
          </View>
        </View>
      </View>

      {/* Bottom: toggle + actions */}
      <View style={cardStyles.bottomRow}>
        <View style={cardStyles.toggleWrap}>
          <CustomToggle
            value={item.available}
            onValueChange={(value) => onToggle(item, value)}
            size="small"
          />
        </View>

        <View style={cardStyles.actions}>
          {item.displayStatus === 'out_of_stock' && (
            <Pressable
              style={({ pressed }) => [
                cardStyles.refillBtn,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => onRefill(item)}>
              <Text style={cardStyles.refillText}>Refill Now</Text>
            </Pressable>
          )}
          <Pressable
            style={({ pressed }) => [
              cardStyles.editBtn,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => onEdit(item)}>
            <MaterialCommunityIcons
              name="pencil-outline"
              size={18}
              color="#888"
            />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              cardStyles.deleteBtn,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => onDelete(item)}>
            <MaterialCommunityIcons
              name="delete-outline"
              size={18}
              color="#AC1D10"
            />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

/* ─── Main Screen ─── */
export default function InventoryScreen() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryOption['id']>('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('All');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryMenuItem | null>(null);
  const [stockItem, setStockItem] = useState<InventoryMenuItem | null>(null);

  const itemsQuery = useQuery({
    queryKey: inventoryQueryKeys.items,
    queryFn: fetchInventoryItems,
  });

  const categoriesQuery = useQuery({
    queryKey: inventoryQueryKeys.categories,
    queryFn: fetchInventoryCategories,
  });

  const categories = categoriesQuery.data ?? [];
  const items = itemsQuery.data ?? [];

  const categoryNameById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  useEffect(() => {
    if (selectedCategoryId !== 'all' && !categoryNameById.has(selectedCategoryId)) {
      setSelectedCategoryId('all');
    }
  }, [categoryNameById, selectedCategoryId]);

  const categoryOptions = useMemo<CategoryOption[]>(
    () => [
      { id: 'all', name: 'All Categories' },
      ...categories.map((category) => ({ id: category.id, name: category.name })),
    ],
    [categories],
  );

  const selectedCategoryLabel =
    selectedCategoryId === 'all'
      ? 'All Categories'
      : categoryNameById.get(selectedCategoryId) ?? 'All Categories';

  const displayItems = useMemo(
    () => items.map((item) => toDisplayItem(item, categoryNameById)),
    [categoryNameById, items],
  );

  const totalItems = displayItems.length;
  const lowStockCount = displayItems.filter(
    (item) => item.displayStatus === 'low_stock',
  ).length;
  const outOfStockCount = displayItems.filter(
    (item) => item.displayStatus === 'out_of_stock',
  ).length;

  const showError = (title: string, error: unknown) => {
    const message = error instanceof Error
      ? error.message
      : 'Please try again in a moment.';
    Alert.alert(title, message);
  };

  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, available }: { id: number; available: boolean }) =>
      updateInventoryItemAvailability(id, available),
    onMutate: async ({ id, available }) => {
      await queryClient.cancelQueries({ queryKey: inventoryQueryKeys.items });
      const previousItems = queryClient.getQueryData<InventoryMenuItem[]>(
        inventoryQueryKeys.items,
      );

      queryClient.setQueryData<InventoryMenuItem[]>(
        inventoryQueryKeys.items,
        (current) =>
          current?.map((item) =>
            item.id === id ? { ...item, available } : item,
          ),
      );

      return { previousItems };
    },
    onError: (error, _vars, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(inventoryQueryKeys.items, context.previousItems);
      }
      showError('Update failed', error);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.items }),
  });

  const updateStockMutation = useMutation({
    mutationFn: ({ id, stockLevel }: { id: number; stockLevel: number }) =>
      updateInventoryItemStock(id, stockLevel),
    onMutate: async ({ id, stockLevel }) => {
      await queryClient.cancelQueries({ queryKey: inventoryQueryKeys.items });
      const previousItems = queryClient.getQueryData<InventoryMenuItem[]>(
        inventoryQueryKeys.items,
      );

      queryClient.setQueryData<InventoryMenuItem[]>(
        inventoryQueryKeys.items,
        (current) =>
          current?.map((item) =>
            item.id === id ? { ...item, stock_level: stockLevel } : item,
          ),
      );

      return { previousItems };
    },
    onError: (error, _vars, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(inventoryQueryKeys.items, context.previousItems);
      }
      showError('Update failed', error);
    },
    onSuccess: () => {
      setStockItem(null);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.items }),
  });

  const createItemMutation = useMutation({
    mutationFn: (payload: InventoryMenuItemInput) => createInventoryItem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.items });
      setShowItemModal(false);
      setEditingItem(null);
    },
    onError: (error) => showError('Create failed', error),
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: InventoryMenuItemInput }) =>
      updateInventoryItem(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.items });
      setShowItemModal(false);
      setEditingItem(null);
    },
    onError: (error) => showError('Update failed', error),
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => deleteInventoryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.items });
    },
    onError: (error) => showError('Delete failed', error),
  });

  const handleToggle = (item: InventoryDisplayItem, nextValue: boolean) => {
    toggleAvailabilityMutation.mutate({ id: item.id, available: nextValue });
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setShowItemModal(true);
  };

  const handleEditItem = (item: InventoryDisplayItem) => {
    setEditingItem(item);
    setShowItemModal(true);
  };

  const handleDeleteItem = (item: InventoryDisplayItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.displayName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteItemMutation.mutate(item.id),
        },
      ],
    );
  };

  const handleSaveItem = (payload: InventoryMenuItemInput) => {
    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, payload });
      return;
    }

    createItemMutation.mutate(payload);
  };

  const handleRefillItem = (item: InventoryDisplayItem) => {
    setStockItem(item);
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    let result = displayItems;

    if (selectedCategoryId !== 'all') {
      result = result.filter((item) => {
        const categoryId = item.category?.id ?? item.category_id;
        return categoryId === selectedCategoryId;
      });
    }

    if (selectedStatus !== 'All') {
      result = result.filter((item) => item.displayStatus === selectedStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.displayName.toLowerCase().includes(q) ||
          item.displayCategory.toLowerCase().includes(q),
      );
    }

    return result;
  }, [displayItems, selectedCategoryId, selectedStatus, searchQuery]);

  const isLoading = itemsQuery.isLoading || categoriesQuery.isLoading;
  const hasError = itemsQuery.isError || categoriesQuery.isError;
  const errorMessage = (() => {
    const error = itemsQuery.error ?? categoriesQuery.error;
    if (!error) {
      return 'Unable to load inventory data.';
    }
    return error instanceof Error ? error.message : 'Unable to load inventory data.';
  })();

  const showLoadingState = isLoading && displayItems.length === 0;

  const formatStatusLabel = (status: StatusFilter) =>
    status === 'All' ? 'Status: All' : status.replace(/_/g, ' ');

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
              value={selectedCategoryLabel}
              onPress={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setShowStatusDropdown(false);
              }}
            />

            {/* Status Dropdown */}
            <DropdownButton
              label="Status"
              value={formatStatusLabel(selectedStatus)}
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

            <Pressable
              style={({ pressed }) => [
                filterStyles.addBtn,
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleAddItem}>
              <MaterialCommunityIcons name="plus" size={14} color="#FFF" />
              <Text style={filterStyles.addText}>New Item</Text>
            </Pressable>
          </Animated.View>

          {/* ── Category Dropdown List ── */}
          {showCategoryDropdown && (
            <Animated.View
              entering={FadeInDown.duration(200)}
              style={dropdownStyles.list}>
              {categoryOptions.map((cat) => (
                <Pressable
                  key={String(cat.id)}
                  onPress={() => {
                    setSelectedCategoryId(cat.id);
                    setShowCategoryDropdown(false);
                  }}
                  style={[
                    dropdownStyles.item,
                    selectedCategoryId === cat.id && dropdownStyles.itemActive,
                  ]}>
                  <Text
                    style={[
                      dropdownStyles.itemText,
                      selectedCategoryId === cat.id && dropdownStyles.itemTextActive,
                    ]}>
                    {cat.name}
                  </Text>
                  {selectedCategoryId === cat.id && (
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
          {hasError ? (
            <View style={styles.errorState}>
              <MaterialCommunityIcons name="alert-circle" size={40} color="#DC2626" />
              <Text style={styles.errorTitle}>Unable to load inventory</Text>
              <Text style={styles.errorSubtitle}>{errorMessage}</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.retryBtn,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => {
                  itemsQuery.refetch();
                  categoriesQuery.refetch();
                }}>
                <Text style={styles.retryText}>Try Again</Text>
              </Pressable>
            </View>
          ) : showLoadingState ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#AC1D10" />
              <Text style={styles.loadingText}>Loading inventory...</Text>
            </View>
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item, i) => (
              <InventoryCard
                key={item.id}
                item={item}
                index={i}
                onToggle={handleToggle}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                onRefill={handleRefillItem}
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

      <ItemFormModal
        visible={showItemModal}
        item={editingItem}
        categories={categories}
        onClose={() => {
          setShowItemModal(false);
          setEditingItem(null);
        }}
        onSubmit={handleSaveItem}
        isSaving={createItemMutation.isPending || updateItemMutation.isPending}
      />

      <StockUpdateModal
        visible={Boolean(stockItem)}
        item={stockItem}
        onClose={() => setStockItem(null)}
        onSave={(stockLevel) => {
          if (!stockItem) {
            return;
          }
          updateStockMutation.mutate({ id: stockItem.id, stockLevel });
        }}
        isSaving={updateStockMutation.isPending}
      />
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
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#666',
  },
  errorState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
  },
  errorSubtitle: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#AC1D10',
  },
  retryText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
  },
  addText: { fontSize: 12, color: '#FFF', fontWeight: '700' },
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
  imagePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
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
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FBE7E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const stockModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    width: '100%',
    maxWidth: 320,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  field: { marginBottom: 18 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  cancelBtn: {
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  cancelBtnText: { fontSize: 13, fontWeight: '700', color: '#666' },
  saveBtn: {
    backgroundColor: '#AC1D10',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  saveBtnText: { fontSize: 13, fontWeight: '700', color: '#FFF' },
});

const itemModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    width: '100%',
    maxWidth: 360,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  field: { marginBottom: 16 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  rowField: { flex: 1 },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  dropdownText: { fontSize: 13, color: '#555', fontWeight: '600' },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 10,
    backgroundColor: '#FFF',
    marginTop: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  dropdownItemText: { fontSize: 13, color: '#555', fontWeight: '500' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 6,
  },
  cancelBtn: {
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  cancelBtnText: { fontSize: 13, fontWeight: '700', color: '#666' },
  saveBtn: {
    backgroundColor: '#AC1D10',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  saveBtnText: { fontSize: 13, fontWeight: '700', color: '#FFF' },
});
