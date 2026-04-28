import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  createInventoryCategory,
  deleteInventoryCategory,
  fetchInventoryCategories,
  fetchInventoryItems,
  inventoryQueryKeys,
  reorderInventoryCategories,
  updateInventoryCategory,
  type InventoryCategory,
} from '@/services/inventoryService';

/* ─── Types ─── */
type CategoryRowItem = InventoryCategory & {
  itemCount: number;
};

const resolveCategoryIcon = (name: string) => {
  const value = name.toLowerCase();

  if (value.includes('burger')) return 'hamburger';
  if (value.includes('pizza')) return 'pizza';
  if (value.includes('dessert') || value.includes('cake') || value.includes('ice')) return 'cupcake';
  if (value.includes('coffee') || value.includes('drink') || value.includes('beverage')) return 'coffee';
  if (value.includes('fish')) return 'fish';
  if (value.includes('chicken')) return 'food-drumstick';
  if (value.includes('rice')) return 'rice';
  if (value.includes('main') || value.includes('meal')) return 'food-fork-drink';

  return 'shape-outline';
};

/* ══════════════════════════════════════════════
   Category Row
   ══════════════════════════════════════════════ */
function CategoryRow({
  category,
  index,
  onEdit,
  onDelete,
  onMove,
  canMoveUp,
  canMoveDown,
  isReordering,
}: {
  category: CategoryRowItem;
  index: number;
  onEdit: (cat: CategoryRowItem) => void;
  onDelete: (cat: CategoryRowItem) => void;
  onMove: (categoryId: number, direction: 'up' | 'down') => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  isReordering: boolean;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(300 + index * 60).duration(400)}
      style={rowStyles.container}>
      <View style={rowStyles.reorderColumn}>
        <Pressable
          style={({ pressed }) => [
            rowStyles.reorderBtn,
            (pressed && !isReordering && canMoveUp) && { opacity: 0.6 },
            (!canMoveUp || isReordering) && rowStyles.reorderBtnDisabled,
          ]}
          onPress={() => onMove(category.id, 'up')}
          disabled={!canMoveUp || isReordering}>
          <MaterialCommunityIcons name="chevron-up" size={16} color="#888" />
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            rowStyles.reorderBtn,
            (pressed && !isReordering && canMoveDown) && { opacity: 0.6 },
            (!canMoveDown || isReordering) && rowStyles.reorderBtnDisabled,
          ]}
          onPress={() => onMove(category.id, 'down')}
          disabled={!canMoveDown || isReordering}>
          <MaterialCommunityIcons name="chevron-down" size={16} color="#888" />
        </Pressable>
      </View>

      {/* Icon */}
      <View style={rowStyles.iconWrap}>
        <MaterialCommunityIcons
          name={resolveCategoryIcon(category.name) as any}
          size={18}
          color="#AC1D10"
        />
      </View>

      {/* Name + Count */}
      <View style={rowStyles.info}>
        <Text style={rowStyles.name}>{category.name}</Text>
      </View>

      <Text style={rowStyles.count}>{category.itemCount} items</Text>

      {/* Actions */}
      <View style={rowStyles.actions}>
        <Pressable
          style={({ pressed }) => [
            rowStyles.actionBtn,
            pressed && { opacity: 0.6 },
          ]}
          onPress={() => onEdit(category)}>
          <MaterialCommunityIcons
            name="pencil-outline"
            size={18}
            color="#888"
          />
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            rowStyles.actionBtn,
            pressed && { opacity: 0.6 },
          ]}
          onPress={() => onDelete(category)}>
          <MaterialCommunityIcons
            name="delete-outline"
            size={18}
            color="#AC1D10"
          />
        </Pressable>
      </View>
    </Animated.View>
  );
}

/* ══════════════════════════════════════════════
   Empty State
   ══════════════════════════════════════════════ */
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(200).duration(500)}
      style={emptyStyles.container}>
      <View style={emptyStyles.iconCircle}>
        <MaterialCommunityIcons
          name="shape-outline"
          size={44}
          color="#AC1D10"
        />
      </View>

      <Text style={emptyStyles.title}>No categories created</Text>
      <Text style={emptyStyles.subtitle}>
        Organize your menu by creating categories like Main Course, Drinks, or
        Desserts to help customers find what they love.
      </Text>

      <Pressable
        style={({ pressed }) => [
          emptyStyles.addBtn,
          pressed && { opacity: 0.8 },
        ]}
        onPress={onAdd}>
        <MaterialCommunityIcons name="plus" size={16} color="#FFF" />
        <Text style={emptyStyles.addBtnText}>Add Your First Category</Text>
      </Pressable>
    </Animated.View>
  );
}

/* ══════════════════════════════════════════════
   Quick Tip Card
   ══════════════════════════════════════════════ */
function QuickTip() {
  return (
    <Animated.View
      entering={FadeInDown.delay(250).duration(400)}
      style={tipStyles.container}>
      <View style={tipStyles.iconWrap}>
        <MaterialCommunityIcons
          name="information"
          size={22}
          color="#1D4ED8"
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={tipStyles.title}>Quick Tip</Text>
        <Text style={tipStyles.text}>
          Categories at the top of this list will appear first in your
          customer-facing app. We recommend placing your most popular categories
          (like Burgers or Rice Meals) near the top for better conversion.
        </Text>
      </View>
    </Animated.View>
  );
}

/* ══════════════════════════════════════════════
   Modal: Create / Edit Category
   ══════════════════════════════════════════════ */
function CategoryFormModal({
  visible,
  category,
  onClose,
  onSave,
  isSaving,
}: {
  visible: boolean;
  category: InventoryCategory | null;
  onClose: () => void;
  onSave: (data: { name: string }) => void;
  isSaving: boolean;
}) {
  const isEdit = category !== null;
  const [name, setName] = React.useState('');

  React.useEffect(() => {
    if (visible) {
      if (category) {
        setName(category.name);
      } else {
        setName('');
      }
    }
  }, [visible, category]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter a category name.');
      return;
    }
    onSave({ name: name.trim() });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.card}>
          {/* Header */}
          <View style={modalStyles.header}>
            <Text style={modalStyles.headerTitle}>
              {isEdit ? 'Edit Category' : 'Create New Category'}
            </Text>
            <Pressable onPress={onClose}>
              <MaterialCommunityIcons name="close" size={20} color="#666" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Category Name */}
            <View style={modalStyles.field}>
              <Text style={modalStyles.label}>Category Name</Text>
              <TextInput
                style={modalStyles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Seafood"
                placeholderTextColor="#AAA"
              />
            </View>

            {/* Buttons */}
            <View style={modalStyles.buttonRow}>
              <Pressable
                style={({ pressed }) => [
                  modalStyles.cancelBtn,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={onClose}>
                <Text style={modalStyles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  modalStyles.saveBtn,
                  pressed && { opacity: 0.8 },
                  isSaving && { opacity: 0.6 },
                ]}
                onPress={handleSave}
                disabled={isSaving}>
                <Text style={modalStyles.saveBtnText}>
                  {isSaving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Category'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ══════════════════════════════════════════════
   Main Screen
   ══════════════════════════════════════════════ */
export default function CategoriesScreen() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<InventoryCategory | null>(null);

  const categoriesQuery = useQuery({
    queryKey: inventoryQueryKeys.categories,
    queryFn: fetchInventoryCategories,
  });

  const itemsQuery = useQuery({
    queryKey: inventoryQueryKeys.items,
    queryFn: fetchInventoryItems,
  });

  const categories = categoriesQuery.data ?? [];
  const items = itemsQuery.data ?? [];

  const itemCounts = useMemo(() => {
    const counts = new Map<number, number>();

    items.forEach((item) => {
      const categoryId = item.category?.id ?? item.category_id;
      if (categoryId == null) {
        return;
      }
      counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1);
    });

    return counts;
  }, [items]);

  const displayCategories = useMemo<CategoryRowItem[]>(
    () =>
      categories.map((category) => ({
        ...category,
        itemCount: itemCounts.get(category.id) ?? 0,
      })),
    [categories, itemCounts],
  );

  const categoryIndexById = useMemo(
    () => new Map(categories.map((category, index) => [category.id, index])),
    [categories],
  );

  const showError = (title: string, error: unknown) => {
    const message = error instanceof Error
      ? error.message
      : 'Please try again in a moment.';
    Alert.alert(title, message);
  };

  const createCategoryMutation = useMutation({
    mutationFn: (payload: { name: string }) => createInventoryCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.categories });
      setShowFormModal(false);
      setEditingCategory(null);
    },
    onError: (error) => showError('Create failed', error),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      updateInventoryCategory(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.categories });
      setShowFormModal(false);
      setEditingCategory(null);
    },
    onError: (error) => showError('Update failed', error),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => deleteInventoryCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.categories });
    },
    onError: (error) => showError('Delete failed', error),
  });

  const reorderCategoryMutation = useMutation({
    mutationFn: (categoryIds: number[]) => reorderInventoryCategories(categoryIds),
    onError: (error) => showError('Reorder failed', error),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: inventoryQueryKeys.categories }),
  });

  /* ─── Filtered ─── */
  const filtered = searchQuery.trim()
    ? displayCategories.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : displayCategories;

  /* ─── Handlers ─── */
  const handleAdd = useCallback(() => {
    setEditingCategory(null);
    setShowFormModal(true);
  }, []);

  const handleEdit = useCallback((cat: CategoryRowItem) => {
    setEditingCategory(cat);
    setShowFormModal(true);
  }, []);

  const handleDelete = useCallback((cat: CategoryRowItem) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${cat.name}"? Items in this category won't be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCategoryMutation.mutate(cat.id);
          },
        },
      ],
    );
  }, [deleteCategoryMutation]);

  const handleSave = useCallback(
    (data: { name: string }) => {
      if (editingCategory) {
        updateCategoryMutation.mutate({ id: editingCategory.id, name: data.name });
        return;
      }

      createCategoryMutation.mutate({ name: data.name });
    },
    [createCategoryMutation, editingCategory, updateCategoryMutation],
  );

  const handleMove = useCallback(
    (categoryId: number, direction: 'up' | 'down') => {
      if (reorderCategoryMutation.isPending) {
        return;
      }

      const currentOrder = categories.map((category) => category.id);
      const index = currentOrder.indexOf(categoryId);
      if (index < 0) {
        return;
      }

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= currentOrder.length) {
        return;
      }

      const nextOrder = [...currentOrder];
      [nextOrder[index], nextOrder[targetIndex]] = [
        nextOrder[targetIndex],
        nextOrder[index],
      ];

      reorderCategoryMutation.mutate(nextOrder);
    },
    [categories, reorderCategoryMutation],
  );

  const isLoading = categoriesQuery.isLoading || itemsQuery.isLoading;
  const hasError = categoriesQuery.isError || itemsQuery.isError;
  const errorMessage = (() => {
    const error = categoriesQuery.error ?? itemsQuery.error;
    if (!error) {
      return 'Unable to load categories.';
    }
    return error instanceof Error ? error.message : 'Unable to load categories.';
  })();

  const showLoadingState = isLoading && categories.length === 0;
  const isSaving = createCategoryMutation.isPending || updateCategoryMutation.isPending;

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
            onPress={() => router.back()}>
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
            <Text style={styles.pageTitle}>Categories</Text>
            <Text style={styles.pageSubtitle}>
              Organize menu items into clear categories for easier browsing by
              customers.
            </Text>
          </Animated.View>

          {hasError ? (
            <View style={styles.errorState}>
              <MaterialCommunityIcons name="alert-circle" size={40} color="#DC2626" />
              <Text style={styles.errorTitle}>Unable to load categories</Text>
              <Text style={styles.errorSubtitle}>{errorMessage}</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.retryBtn,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => {
                  categoriesQuery.refetch();
                  itemsQuery.refetch();
                }}>
                <Text style={styles.retryText}>Try Again</Text>
              </Pressable>
            </View>
          ) : showLoadingState ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#AC1D10" />
              <Text style={styles.loadingText}>Loading categories...</Text>
            </View>
          ) : categories.length > 0 ? (
            <>
              {/* ── Add Category Button ── */}
              <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                <Pressable
                  style={({ pressed }) => [
                    styles.addBtn,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={handleAdd}>
                  <MaterialCommunityIcons name="plus" size={14} color="#FFF" />
                  <Text style={styles.addBtnText}>Add Category</Text>
                </Pressable>
              </Animated.View>

              {/* ── Quick Tip ── */}
              <QuickTip />

              {/* ── Table Header ── */}
              <Animated.View
                entering={FadeInDown.delay(280).duration(400)}
                style={tableStyles.header}>
                <Text style={[tableStyles.headerText, { flex: 1 }]}>
                  Category Name
                </Text>
                <Text style={[tableStyles.headerText, { width: 80, textAlign: 'center' }]}>
                  Menu Items
                </Text>
                <Text style={[tableStyles.headerText, { width: 70, textAlign: 'center' }]}>
                  Actions
                </Text>
              </Animated.View>

              {/* ── Category Rows ── */}
              {filtered.map((cat, i) => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  index={i}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onMove={handleMove}
                  canMoveUp={(categoryIndexById.get(cat.id) ?? 0) > 0}
                  canMoveDown={(categoryIndexById.get(cat.id) ?? 0) < categories.length - 1}
                  isReordering={reorderCategoryMutation.isPending}
                />
              ))}

              {filtered.length === 0 && searchQuery.trim() && (
                <View style={styles.noResults}>
                  <Text style={styles.noResultsText}>
                    No categories match "{searchQuery}"
                  </Text>
                </View>
              )}
            </>
          ) : (
            <EmptyState onAdd={handleAdd} />
          )}

          {/* bottom spacer */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* ── Modal ── */}
      <CategoryFormModal
        visible={showFormModal}
        category={editingCategory}
        onClose={() => {
          setShowFormModal(false);
          setEditingCategory(null);
        }}
        onSave={handleSave}
        isSaving={isSaving}
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

  /* Add Button */
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: '#AC1D10',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 14,
  },
  addBtnText: { fontSize: 12, fontWeight: '700', color: '#FFF' },

  /* No Results */
  noResults: { paddingVertical: 30, alignItems: 'center' },
  noResultsText: { fontSize: 13, color: '#999' },
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

/* ─── Row Styles ─── */
const rowStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 10,
  },
  reorderColumn: {
    width: 24,
    alignItems: 'center',
    gap: 2,
  },
  reorderBtn: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderBtnDisabled: {
    opacity: 0.4,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FBE7E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  count: { fontSize: 12, color: '#999', width: 55, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 6 },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/* ─── Table Header Styles ─── */
const tableStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  headerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#AAA',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});

/* ─── Empty State Styles ─── */
const emptyStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 30,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FBE7E4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 24,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#AC1D10',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  addBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});

/* ─── Quick Tip Styles ─── */
const tipStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F0F4FF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  text: {
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
  },
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
  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    width: '100%',
    maxWidth: 340,
    padding: 20,
    maxHeight: '80%',
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

  /* Buttons */
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
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
