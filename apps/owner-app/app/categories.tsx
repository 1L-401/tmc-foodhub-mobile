import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
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

/* ─── Icon Options ─── */
const ICON_OPTIONS: { name: string; label: string }[] = [
  { name: 'hamburger', label: 'Burger' },
  { name: 'glass-wine', label: 'Wine' },
  { name: 'coffee', label: 'Coffee' },
  { name: 'food-drumstick', label: 'Chicken' },
  { name: 'cupcake', label: 'Dessert' },
  { name: 'food-fork-drink', label: 'Meal' },
  { name: 'pizza', label: 'Pizza' },
  { name: 'fish', label: 'Fish' },
  { name: 'rice', label: 'Rice' },
  { name: 'ice-cream', label: 'Ice Cream' },
];

/* ─── Types ─── */
interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  itemCount: number;
}

/* ─── Mock Data ─── */
const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Burgers', icon: 'hamburger', description: 'All burger varieties', itemCount: 8 },
  { id: '2', name: 'Pizzas', icon: 'pizza', description: 'Pizza selections', itemCount: 4 },
  { id: '3', name: 'Main Courses', icon: 'food-fork-drink', description: 'Main course dishes', itemCount: 12 },
  { id: '4', name: 'Desserts', icon: 'cupcake', description: 'Sweet treats', itemCount: 8 },
  { id: '5', name: 'Beverages', icon: 'coffee', description: 'Drinks and beverages', itemCount: 14 },
];

/* ══════════════════════════════════════════════
   Category Row
   ══════════════════════════════════════════════ */
function CategoryRow({
  category,
  index,
  onEdit,
  onDelete,
}: {
  category: Category;
  index: number;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(300 + index * 60).duration(400)}
      style={rowStyles.container}>
      {/* Drag handle */}
      <View style={rowStyles.dragHandle}>
        <MaterialCommunityIcons name="dots-grid" size={18} color="#CCC" />
      </View>

      {/* Icon */}
      <View style={rowStyles.iconWrap}>
        <MaterialCommunityIcons
          name={category.icon as any}
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
}: {
  visible: boolean;
  category: Category | null;
  onClose: () => void;
  onSave: (data: { name: string; icon: string; description: string }) => void;
}) {
  const isEdit = category !== null;
  const [name, setName] = React.useState('');
  const [selectedIcon, setSelectedIcon] = React.useState('hamburger');
  const [description, setDescription] = React.useState('');

  React.useEffect(() => {
    if (visible) {
      if (category) {
        setName(category.name);
        setSelectedIcon(category.icon);
        setDescription(category.description);
      } else {
        setName('');
        setSelectedIcon('hamburger');
        setDescription('');
      }
    }
  }, [visible, category]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter a category name.');
      return;
    }
    onSave({ name: name.trim(), icon: selectedIcon, description: description.trim() });
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

            {/* Choose Icon */}
            <View style={modalStyles.field}>
              <Text style={modalStyles.label}>Choose Icon</Text>
              <View style={modalStyles.iconGrid}>
                {ICON_OPTIONS.map((icon) => (
                  <Pressable
                    key={icon.name}
                    style={[
                      modalStyles.iconOption,
                      selectedIcon === icon.name && modalStyles.iconOptionActive,
                    ]}
                    onPress={() => setSelectedIcon(icon.name)}>
                    <MaterialCommunityIcons
                      name={icon.name as any}
                      size={20}
                      color={selectedIcon === icon.name ? '#FFF' : '#888'}
                    />
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Description */}
            <View style={modalStyles.field}>
              <Text style={modalStyles.label}>Description (Optional)</Text>
              <TextInput
                style={[modalStyles.input, modalStyles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Write the description..."
                placeholderTextColor="#AAA"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
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
                ]}
                onPress={handleSave}>
                <Text style={modalStyles.saveBtnText}>
                  {isEdit ? 'Save Changes' : 'Create Category'}
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
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  /* ─── Filtered ─── */
  const filtered = searchQuery.trim()
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : categories;

  /* ─── Handlers ─── */
  const handleAdd = useCallback(() => {
    setEditingCategory(null);
    setShowFormModal(true);
  }, []);

  const handleEdit = useCallback((cat: Category) => {
    setEditingCategory(cat);
    setShowFormModal(true);
  }, []);

  const handleDelete = useCallback((cat: Category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${cat.name}"? Items in this category won't be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCategories((prev) => prev.filter((c) => c.id !== cat.id));
          },
        },
      ],
    );
  }, []);

  const handleSave = useCallback(
    (data: { name: string; icon: string; description: string }) => {
      if (editingCategory) {
        // Edit
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id
              ? { ...c, name: data.name, icon: data.icon, description: data.description }
              : c,
          ),
        );
        Alert.alert('Success', `"${data.name}" has been updated.`, [
          { text: 'OK', onPress: () => setShowFormModal(false) },
        ]);
      } else {
        // Create
        const newCat: Category = {
          id: Date.now().toString(),
          name: data.name,
          icon: data.icon,
          description: data.description,
          itemCount: 0,
        };
        setCategories((prev) => [...prev, newCat]);
        Alert.alert('Success', `"${data.name}" has been created.`, [
          { text: 'OK', onPress: () => setShowFormModal(false) },
        ]);
      }
    },
    [editingCategory],
  );

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

          {categories.length > 0 ? (
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
  dragHandle: {
    width: 20,
    alignItems: 'center',
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  /* Icon Grid */
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconOption: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  iconOptionActive: {
    backgroundColor: '#AC1D10',
    borderColor: '#AC1D10',
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
