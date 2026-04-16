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

/* ─── Types ─── */
type PromoStatus = 'Active' | 'Scheduled' | 'Expired';
type FilterType = 'All' | PromoStatus;

interface Promotion {
  id: string;
  title: string;
  subtitle: string;
  dates: string;
  badgeText: string;
  status: PromoStatus;
}

/* ─── Mock Data ─── */
const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: '1',
    title: 'Lunch Rush Special',
    subtitle: 'Applies to: All Lunch Bowls',
    dates: 'Mar 2 - Mar 6, 2026',
    badgeText: '20% Off',
    status: 'Active',
  },
  {
    id: '2',
    title: 'Weekend Feast',
    subtitle: 'Fixed ₱50 Off',
    dates: 'Mar 9 - Mar 13, 2026',
    badgeText: 'Fixed ₱50 Off',
    status: 'Active',
  },
  {
    id: '3',
    title: 'BOGO Burger Day',
    subtitle: 'BOGO Burger Day',
    dates: 'Mar 8, 2026',
    badgeText: 'Buy 1, Get 1',
    status: 'Scheduled',
  },
  {
    id: '4',
    title: 'Free Delivery Monday',
    subtitle: 'Applies to: Orders > ₱300',
    dates: 'Feb 23, 2026',
    badgeText: 'Free Delivery',
    status: 'Expired',
  },
];

/* ══════════════════════════════════════════════
   Promo Card
   ══════════════════════════════════════════════ */
function PromoCard({
  promo,
  index,
  onEdit,
  onDelete,
}: {
  promo: Promotion;
  index: number;
  onEdit: (p: Promotion) => void;
  onDelete: (p: Promotion) => void;
}) {
  const getStatusStyle = (status: PromoStatus) => {
    switch (status) {
      case 'Active':
        return { bg: '#E4F8EE', text: '#047857' }; // Green
      case 'Scheduled':
        return { bg: '#E4F8EE', text: '#059669' }; // Darker greener
      case 'Expired':
        return { bg: '#FEE2E2', text: '#DC2626' }; // Red
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const statusStyle = getStatusStyle(promo.status);

  return (
    <Animated.View
      entering={FadeInDown.delay(250 + index * 50).duration(400)}
      style={cardStyles.container}>
      <View style={cardStyles.topRow}>
        <View style={cardStyles.infoWrap}>
          <Text style={cardStyles.title}>{promo.title}</Text>
          <Text style={cardStyles.subtitle}>{promo.subtitle}</Text>
        </View>
        <View style={cardStyles.promoBadge}>
          <MaterialCommunityIcons name="ticket-percent-outline" size={14} color="#AC1D10" />
          <Text style={cardStyles.promoBadgeText}>{promo.badgeText}</Text>
        </View>
      </View>

      <View style={cardStyles.bottomRow}>
        <Text style={cardStyles.dates}>{promo.dates}</Text>

        <View style={cardStyles.rightActions}>
          <View style={[cardStyles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[cardStyles.statusText, { color: statusStyle.text }]}>{promo.status}</Text>
          </View>
          
          <Pressable
            style={({ pressed }) => [cardStyles.actionBtn, pressed && { opacity: 0.6 }]}
            onPress={() => onEdit(promo)}>
            <MaterialCommunityIcons name="pencil-outline" size={16} color="#888" />
          </Pressable>
          <Pressable
            style={({ pressed }) => [cardStyles.actionBtn, pressed && { opacity: 0.6 }]}
            onPress={() => onDelete(promo)}>
            <MaterialCommunityIcons name="delete-outline" size={16} color="#444" />
          </Pressable>
        </View>
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
        <MaterialCommunityIcons name="gift-outline" size={44} color="#AC1D10" />
      </View>

      <Text style={emptyStyles.title}>No promotions yet</Text>
      <Text style={emptyStyles.subtitle}>
        Attract more customers by creating discounts, buy-one-get-one deals, or free delivery offers.
      </Text>

      <Pressable
        style={({ pressed }) => [
          emptyStyles.addBtn,
          pressed && { opacity: 0.8 },
        ]}
        onPress={onAdd}>
        <MaterialCommunityIcons name="plus" size={16} color="#FFF" />
        <Text style={emptyStyles.addBtnText}>Create Your First Promotion</Text>
      </Pressable>
    </Animated.View>
  );
}

/* ══════════════════════════════════════════════
   Form Modal
   ══════════════════════════════════════════════ */
function PromotionFormModal({
  visible,
  promotion,
  onClose,
  onSave,
}: {
  visible: boolean;
  promotion: Promotion | null;
  onClose: () => void;
  onSave: (data: Partial<Promotion>) => void;
}) {
  const isEdit = promotion !== null;
  const [name, setName] = useState('');
  const [type, setType] = useState('Percentage Off (%)');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [applicability, setApplicability] = useState<'all' | 'specific'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  React.useEffect(() => {
    if (visible) {
      if (promotion) {
        setName(promotion.title);
        // Resetting other fields for simulation
        setType('Percentage Off (%)');
        setDiscountValue('20');
        setMinOrder('0');
        setApplicability('all');
        const [start, end] = promotion.dates.split(' - ');
        setStartDate(start || '03/02/2026');
        setEndDate(end || '03/06/2026');
      } else {
        setName('');
        setType('Percentage Off (%)');
        setDiscountValue('');
        setMinOrder('');
        setApplicability('all');
        setStartDate('');
        setEndDate('');
      }
    }
  }, [visible, promotion]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter a promotion name.');
      return;
    }
    
    // Simplistic text generator for mockup logic
    let badgeText = 'Discount';
    if (type.includes('%')) badgeText = `${discountValue || 0}% Off`;
    else if (type.includes('Fixed')) badgeText = `Fixed ₱${discountValue || 0} Off`;
    else if (type.includes('BOGO')) badgeText = 'Buy 1, Get 1';
    else if (type.includes('Delivery')) badgeText = 'Free Delivery';

    onSave({
      title: name,
      badgeText,
      subtitle: applicability === 'all' ? 'Applies to: All Menu Items' : 'Applies to: Specific Items',
      dates: `${startDate || 'ASAP'} - ${endDate || 'TBD'}`,
      status: 'Scheduled', // default mock status
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.card}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.headerTitle}>
              {isEdit ? 'Edit Promotion' : 'Create New Promotion'}
            </Text>
            <Pressable onPress={onClose}>
              <MaterialCommunityIcons name="close" size={20} color="#666" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
            {/* Section 1: Promotion Details */}
            <Text style={modalStyles.sectionTitle}>Promotion Details</Text>
            <View style={modalStyles.rowForm}>
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.label}>Name of Promotion</Text>
                <TextInput
                  style={modalStyles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Summer Pizza Party"
                  placeholderTextColor="#AAA"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.label}>Promotion Type</Text>
                <View style={modalStyles.inputDropdown}>
                  <Text style={modalStyles.inputText}>{type}</Text>
                  <MaterialCommunityIcons name="chevron-down" size={16} color="#888" />
                </View>
              </View>
            </View>

            {/* Section 2: Discount Configuration */}
            <Text style={modalStyles.sectionTitle}>Discount Configuration</Text>
            <View style={modalStyles.rowForm}>
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.label}>Discount Value</Text>
                <View style={modalStyles.inputWrapPrefix}>
                  <MaterialCommunityIcons name="currency-php" size={16} color="#888" />
                  <TextInput
                    style={modalStyles.inputNoBorder}
                    value={discountValue}
                    onChangeText={setDiscountValue}
                    placeholder="0.00"
                    placeholderTextColor="#AAA"
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.label}>Minimum Order Value</Text>
                <View style={modalStyles.inputWrapPrefix}>
                  <MaterialCommunityIcons name="currency-php" size={16} color="#888" />
                  <TextInput
                    style={modalStyles.inputNoBorder}
                    value={minOrder}
                    onChangeText={setMinOrder}
                    placeholder="250.00"
                    placeholderTextColor="#AAA"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Section 3: Applicability */}
            <Text style={modalStyles.sectionTitle}>Applicability</Text>
            <View style={modalStyles.radioGroup}>
              <View style={modalStyles.radioRow}>
                <Pressable
                  style={modalStyles.radioItem}
                  onPress={() => setApplicability('all')}>
                  <MaterialCommunityIcons
                    name={applicability === 'all' ? 'radiobox-marked' : 'radiobox-blank'}
                    size={20}
                    color={applicability === 'all' ? '#AC1D10' : '#CCC'}
                  />
                  <Text style={modalStyles.radioLabel}>All Menu Items</Text>
                </Pressable>
                <Pressable
                  style={modalStyles.radioItem}
                  onPress={() => setApplicability('specific')}>
                  <MaterialCommunityIcons
                    name={applicability === 'specific' ? 'radiobox-marked' : 'radiobox-blank'}
                    size={20}
                    color={applicability === 'specific' ? '#AC1D10' : '#CCC'}
                  />
                  <Text style={modalStyles.radioLabel}>Specific Categories/Items</Text>
                </Pressable>
              </View>
            </View>
            
            {applicability === 'specific' && (
              <Animated.View entering={FadeInDown.duration(200)}>
                <View style={[modalStyles.searchWrap, { marginTop: 8 }]}>
                  <MaterialCommunityIcons name="magnify" size={16} color="#AAA" />
                  <TextInput
                    style={[modalStyles.inputNoBorder, { flex: 1 }]}
                    placeholder="Search items..."
                    placeholderTextColor="#AAA"
                  />
                </View>
                <View style={modalStyles.tagsRow}>
                  <View style={modalStyles.tag}>
                    <Text style={modalStyles.tagText}>Breakfast Meals</Text>
                    <MaterialCommunityIcons name="close" size={14} color="#AC1D10" />
                  </View>
                  <View style={modalStyles.tag}>
                    <Text style={modalStyles.tagText}>Signature Pasta</Text>
                    <MaterialCommunityIcons name="close" size={14} color="#AC1D10" />
                  </View>
                  <View style={modalStyles.tag}>
                    <Text style={modalStyles.tagText}>Beverages</Text>
                    <MaterialCommunityIcons name="close" size={14} color="#AC1D10" />
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Section 4: Date Schedule */}
            <Text style={[modalStyles.sectionTitle, { marginTop: applicability === 'all' ? 0 : 10 }]}>Date Schedule</Text>
            <View style={modalStyles.rowForm}>
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.label}>Start Date</Text>
                <View style={modalStyles.inputDropdown}>
                  <TextInput
                    style={{ flex: 1, fontSize: 13, color: '#1A1A1A' }}
                    value={startDate}
                    onChangeText={setStartDate}
                    placeholder="mm/dd/yyyy"
                    placeholderTextColor="#AAA"
                  />
                  <MaterialCommunityIcons name="calendar-blank-outline" size={16} color="#888" />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.label}>End Date</Text>
                <View style={modalStyles.inputDropdown}>
                  <TextInput
                    style={{ flex: 1, fontSize: 13, color: '#1A1A1A' }}
                    value={endDate}
                    onChangeText={setEndDate}
                    placeholder="mm/dd/yyyy"
                    placeholderTextColor="#AAA"
                  />
                  <MaterialCommunityIcons name="calendar-blank-outline" size={16} color="#888" />
                </View>
              </View>
            </View>

            {/* Buttons */}
            <View style={modalStyles.buttonRow}>
              <Pressable style={({ pressed }) => [modalStyles.cancelBtn, pressed && { opacity: 0.7 }]} onPress={onClose}>
                <Text style={modalStyles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [modalStyles.saveBtn, pressed && { opacity: 0.8 }]} onPress={handleSave}>
                <Text style={modalStyles.saveBtnText}>Save Promotion</Text>
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
export default function PromotionsScreen() {
  const [promotions, setPromotions] = useState<Promotion[]>(INITIAL_PROMOTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  /* ─── Filtered ─── */
  const filtered = promotions.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || p.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const hasAnyData = promotions.length > 0;

  /* ─── Handlers ─── */
  const handleAdd = useCallback(() => {
    setEditingPromo(null);
    setShowFormModal(true);
  }, []);

  const handleEdit = useCallback((p: Promotion) => {
    setEditingPromo(p);
    setShowFormModal(true);
  }, []);

  const handleDelete = useCallback((promo: Promotion) => {
    Alert.alert(
      'Delete Promotion',
      `Are you sure you want to delete "${promo.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPromotions((prev) => prev.filter((p) => p.id !== promo.id));
          },
        },
      ],
    );
  }, []);

  const handleSave = useCallback(
    (data: Partial<Promotion>) => {
      if (editingPromo) {
        setPromotions((prev) =>
          prev.map((p) =>
            p.id === editingPromo.id ? { ...p, ...data } : p,
          ),
        );
        Alert.alert('Success', `"${data.title}" has been updated.`, [
          { text: 'OK', onPress: () => setShowFormModal(false) },
        ]);
      } else {
        const newPromo: Promotion = {
          id: Date.now().toString(),
          title: data.title || '',
          subtitle: data.subtitle || '',
          dates: data.dates || '',
          badgeText: data.badgeText || '',
          status: data.status || 'Active',
        };
        setPromotions((prev) => [newPromo, ...prev]);
        Alert.alert('Success', `"${data.title}" has been created.`, [
          { text: 'OK', onPress: () => setShowFormModal(false) },
        ]);
      }
    },
    [editingPromo],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {/* ── Top Bar ── */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)} style={styles.topBar}>
          <Pressable style={({ pressed }) => [pressed && styles.pressed]} onPress={() => router.back()}>
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
              <MaterialCommunityIcons name="account-circle" size={32} color="#AC1D10" />
            </Pressable>
          </View>
        </Animated.View>

        {/* ── Search ── */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.searchWrap}>
          <MaterialCommunityIcons name="magnify" size={18} color="#AAA" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            placeholderTextColor="#AAA"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* ── Title ── */}
          <Animated.View entering={FadeInDown.delay(150).duration(400)}>
            <Text style={styles.pageTitle}>Promotions & Deals</Text>
            <Text style={styles.pageSubtitle}>
              Create discounts, special deals, or limited-time offers to attract more customers.
            </Text>
          </Animated.View>

          {hasAnyData ? (
            <>
              {/* ── Filters ── */}
              <Animated.View entering={FadeInDown.delay(200).duration(400)} style={filterStyles.container}>
                {(['All', 'Active', 'Scheduled', 'Expired'] as FilterType[]).map((tab) => (
                  <Pressable
                    key={tab}
                    onPress={() => setActiveFilter(tab)}
                    style={[filterStyles.tab, activeFilter === tab && filterStyles.tabActive]}>
                    <Text style={[filterStyles.tabText, activeFilter === tab && filterStyles.tabTextActive]}>
                      {tab}
                    </Text>
                  </Pressable>
                ))}
              </Animated.View>

              {/* Add Button */}
              <Animated.View entering={FadeInDown.delay(250).duration(400)}>
                <Pressable
                  style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.8 }]}
                  onPress={handleAdd}>
                  <MaterialCommunityIcons name="plus" size={14} color="#FFF" />
                  <Text style={styles.addBtnText}>Add Promotion</Text>
                </Pressable>
              </Animated.View>

              {/* ── Stats ── */}
              <Animated.View entering={FadeInDown.delay(300).duration(400)} style={statsStyles.container}>
                <View style={statsStyles.card}>
                  <Text style={statsStyles.label}>Avg. Promotion Conversion</Text>
                  <Text style={statsStyles.value}>24.5%</Text>
                  <Text style={statsStyles.sub}>+2.4% vs last month</Text>
                </View>
                <View style={statsStyles.card}>
                  <Text style={statsStyles.label}>Promo-Assisted Sales</Text>
                  <Text style={statsStyles.value}>₱124,500</Text>
                  <Text style={statsStyles.sub}>Current active campaigns</Text>
                </View>
              </Animated.View>

              {/* ── Promotions List ── */}
              {filtered.map((promo, idx) => (
                <PromoCard
                  key={promo.id}
                  promo={promo}
                  index={idx}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}

              {filtered.length === 0 && (
                <View style={styles.noResults}>
                  <Text style={styles.noResultsText}>No promotions found for this filter.</Text>
                </View>
              )}
            </>
          ) : (
            <EmptyState onAdd={handleAdd} />
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* ── Modal ── */}
      <PromotionFormModal
        visible={showFormModal}
        promotion={editingPromo}
        onClose={() => {
          setShowFormModal(false);
          setEditingPromo(null);
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
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
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
  logoIcon: { width: 28, height: 28, borderRadius: 6, backgroundColor: '#AC1D10', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#FFF', fontSize: 8, fontWeight: '900' },
  logoTitle: { fontSize: 8, color: '#1A1A1A', fontWeight: '500', lineHeight: 10 },
  logoBold: { fontWeight: '900', color: '#AC1D10' },
  topBarRight: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FBE7E4', alignItems: 'center', justifyContent: 'center' },

  /* Search */
  searchWrap: {
    marginHorizontal: 16,
    marginBottom: 16,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1A1A1A' },

  scrollContent: { paddingHorizontal: 16 },

  /* Header */
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A' },
  pageSubtitle: { fontSize: 14, color: '#666', marginTop: 4, marginBottom: 16, lineHeight: 20 },

  /* Add Button */
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#9E1C1A',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
  },
  addBtnText: { fontSize: 13, fontWeight: '700', color: '#FFF' },

  /* No Results */
  noResults: { paddingVertical: 40, alignItems: 'center' },
  noResultsText: { fontSize: 14, color: '#888' },
});

/* Tabs/Filters */
const filterStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    backgroundColor: '#FFF',
    marginBottom: 16,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E5E5',
  },
  tabActive: { backgroundColor: '#AC1D10' },
  tabText: { fontSize: 12, color: '#888', fontWeight: '500' },
  tabTextActive: { color: '#FFF', fontWeight: '700' },
});

/* Stats */
const statsStyles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#FFF',
  },
  label: { fontSize: 10, color: '#999', marginBottom: 4, fontWeight: '500' },
  value: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginBottom: 2 },
  sub: { fontSize: 9, color: '#888' },
});

/* Promo Card */
const cardStyles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 12,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  infoWrap: { flex: 1, paddingRight: 10 },
  title: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#888' },
  promoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCECEC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  promoBadgeText: { fontSize: 12, fontWeight: '700', color: '#AC1D10' },
  
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dates: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  
  rightActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginRight: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/* Empty State */
const emptyStyles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 50, paddingHorizontal: 30 },
  iconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#888', lineHeight: 19, textAlign: 'center', marginBottom: 24 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#AC1D10', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 12 },
  addBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});

/* Modal */
const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 16, width: '100%', maxWidth: 360, padding: 20, maxHeight: '85%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#1A1A1A', marginBottom: 10, marginTop: 4 },
  rowForm: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  label: { fontSize: 11, fontWeight: '700', color: '#555', marginBottom: 6 },
  
  input: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#1A1A1A', backgroundColor: '#FFF' },
  inputDropdown: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inputText: { fontSize: 13, color: '#1A1A1A' },
  inputWrapPrefix: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, paddingHorizontal: 10, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center' },
  inputNoBorder: { flex: 1, paddingVertical: 10, fontSize: 13, color: '#1A1A1A', marginLeft: 4 },
  searchWrap: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, paddingHorizontal: 10, backgroundColor: '#FAFAFA', flexDirection: 'row', alignItems: 'center' },
  
  radioGroup: { marginBottom: 10 },
  radioRow: { flexDirection: 'row', gap: 16 },
  radioItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  radioLabel: { fontSize: 12, color: '#555' },
  
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, marginBottom: 16 },
  tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FCECEC', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 4 },
  tagText: { fontSize: 11, color: '#AC1D10', fontWeight: '500' },
  
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 16, justifyContent: 'center' },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderColor: '#E5E5E5', borderRadius: 8, paddingVertical: 12, alignItems: 'center', backgroundColor: '#FFF' },
  cancelBtnText: { fontSize: 13, fontWeight: '700', color: '#666' },
  saveBtn: { flex: 1, backgroundColor: '#AC1D10', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  saveBtnText: { fontSize: 13, fontWeight: '700', color: '#FFF' },
});
