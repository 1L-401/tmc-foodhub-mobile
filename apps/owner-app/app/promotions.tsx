import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/src/api/apiClient';

/* ─── Types ─── */
type PromoStatus = 'Active' | 'Scheduled' | 'Expired' | 'Inactive';
type FilterType = 'All' | PromoStatus;

interface Promotion {
  id: string;
  name: string;
  code: string;
  appliesTo: string;
  type: string;
  value: string;
  validDates: string;
  status: PromoStatus;
  raw_status: string;
  raw_start_date: string;
  raw_end_date: string;
  discount_type: string;
  discount_value: number;
  minimum_order_value?: number;
}

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
          <Text style={cardStyles.title}>{promo.name}</Text>
          <Text style={cardStyles.subtitle}>Code: {promo.code} • {promo.appliesTo}</Text>
        </View>
        <View style={cardStyles.promoBadge}>
          <MaterialCommunityIcons name="ticket-percent-outline" size={14} color="#AC1D10" />
          <Text style={cardStyles.promoBadgeText}>{promo.value}</Text>
        </View>
      </View>

      <View style={cardStyles.bottomRow}>
        <Text style={cardStyles.dates}>{promo.validDates}</Text>

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
  isSaving,
}: {
  visible: boolean;
  promotion: Promotion | null;
  onClose: () => void;
  onSave: (data: any) => void;
  isSaving: boolean;
}) {
  const isEdit = promotion !== null;
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('active');

  React.useEffect(() => {
    if (visible) {
      if (promotion) {
        setName(promotion.name);
        setCode(promotion.code);
        setType(promotion.discount_type);
        setDiscountValue(String(promotion.discount_value));
        setMinOrder(promotion.minimum_order_value ? String(promotion.minimum_order_value) : '');
        setStartDate(promotion.raw_start_date.split('T')[0]);
        setEndDate(promotion.raw_end_date.split('T')[0]);
        setStatus(promotion.raw_status);
      } else {
        setName('');
        setCode('');
        setType('percentage');
        setDiscountValue('');
        setMinOrder('');
        setStartDate(new Date().toISOString().split('T')[0]);
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        setEndDate(nextWeek.toISOString().split('T')[0]);
        setStatus('active');
      }
    }
  }, [visible, promotion]);

  const handleSave = () => {
    if (!name.trim() || !code.trim() || !discountValue.trim() || !startDate.trim() || !endDate.trim()) {
      Alert.alert('Validation', 'Please fill in all required fields.');
      return;
    }

    onSave({
      name,
      code,
      discount_type: type,
      discount_value: Number(discountValue),
      minimum_order_value: minOrder ? Number(minOrder) : null,
      start_date: startDate,
      end_date: endDate,
      status,
    });
  };

  const toggleType = () => {
    const types = ['percentage', 'fixed', 'free_delivery'];
    const nextIdx = (types.indexOf(type) + 1) % types.length;
    setType(types[nextIdx]);
  };

  const getTypeText = () => {
    if (type === 'percentage') return 'Percentage Off (%)';
    if (type === 'fixed') return 'Fixed Amount (₱)';
    if (type === 'free_delivery') return 'Free Delivery';
    return 'BOGO';
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.card}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.headerTitle}>
              {isEdit ? 'Edit Promotion' : 'Create New Promotion'}
            </Text>
            <Pressable onPress={onClose} disabled={isSaving}>
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
                  placeholder="e.g. Summer Party"
                  placeholderTextColor="#AAA"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.label}>Promo Code</Text>
                <TextInput
                  style={modalStyles.input}
                  value={code}
                  onChangeText={setCode}
                  placeholder="e.g. SUMMER20"
                  autoCapitalize="characters"
                  placeholderTextColor="#AAA"
                />
              </View>
            </View>

            {/* Section 2: Discount Configuration */}
            <Text style={modalStyles.sectionTitle}>Discount Configuration</Text>
            <View style={modalStyles.rowForm}>
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.label}>Promotion Type</Text>
                <Pressable style={modalStyles.inputDropdown} onPress={toggleType}>
                  <Text style={modalStyles.inputText}>{getTypeText()}</Text>
                  <MaterialCommunityIcons name="chevron-down" size={16} color="#888" />
                </Pressable>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.label}>Discount Value</Text>
                <View style={modalStyles.inputWrapPrefix}>
                  <MaterialCommunityIcons name={type === 'percentage' ? "percent" : "currency-php"} size={16} color="#888" />
                  <TextInput
                    style={modalStyles.inputNoBorder}
                    value={discountValue}
                    onChangeText={setDiscountValue}
                    placeholder="0.00"
                    placeholderTextColor="#AAA"
                    keyboardType="numeric"
                    editable={type !== 'free_delivery'}
                  />
                </View>
              </View>
            </View>

            {/* Section 3: More Configuration */}
            <View style={modalStyles.rowForm}>
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.label}>Min Order (Optional)</Text>
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

            {/* Section 4: Date Schedule */}
            <Text style={modalStyles.sectionTitle}>Date Schedule</Text>
            <View style={modalStyles.rowForm}>
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.label}>Start Date</Text>
                <View style={modalStyles.inputDropdown}>
                  <TextInput
                    style={{ flex: 1, fontSize: 13, color: '#1A1A1A' }}
                    value={startDate}
                    onChangeText={setStartDate}
                    placeholder="YYYY-MM-DD"
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
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#AAA"
                  />
                  <MaterialCommunityIcons name="calendar-blank-outline" size={16} color="#888" />
                </View>
              </View>
            </View>

            {/* Buttons */}
            <View style={modalStyles.buttonRow}>
              <Pressable style={({ pressed }) => [modalStyles.cancelBtn, pressed && { opacity: 0.7 }]} onPress={onClose} disabled={isSaving}>
                <Text style={modalStyles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [modalStyles.saveBtn, pressed && { opacity: 0.8 }]} onPress={handleSave} disabled={isSaving}>
                {isSaving ? (
                   <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={modalStyles.saveBtnText}>Save Promotion</Text>
                )}
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
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  const { data: promotions = [], isLoading } = useQuery<Promotion[]>({
    queryKey: ['promotions'],
    queryFn: () => apiClient('/promotions'),
  });

  const createPromo = useMutation({
    mutationFn: (data: any) => apiClient('/promotions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      setShowFormModal(false);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to create promotion');
    }
  });
  
  const updatePromo = useMutation({
    mutationFn: ({ id, ...data }: any) => apiClient(`/promotions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      setShowFormModal(false);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to update promotion');
    }
  });
  
  const deletePromo = useMutation({
    mutationFn: (id: string) => apiClient(`/promotions/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to delete promotion');
    }
  });

  /* ─── Filtered ─── */
  const filtered = promotions.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase());
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
      `Are you sure you want to delete "${promo.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deletePromo.mutate(promo.id);
          },
        },
      ],
    );
  }, [deletePromo]);

  const handleSave = useCallback(
    (data: any) => {
      if (editingPromo) {
        updatePromo.mutate({ id: editingPromo.id, ...data });
      } else {
        createPromo.mutate(data);
      }
    },
    [editingPromo, createPromo, updatePromo],
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

          {isLoading ? (
            <ActivityIndicator size="large" color="#AC1D10" style={{ marginTop: 40 }} />
          ) : hasAnyData ? (
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
        isSaving={createPromo.isPending || updatePromo.isPending}
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
  
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 16, justifyContent: 'center' },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderColor: '#E5E5E5', borderRadius: 8, paddingVertical: 12, alignItems: 'center', backgroundColor: '#FFF' },
  cancelBtnText: { fontSize: 13, fontWeight: '700', color: '#666' },
  saveBtn: { flex: 1, backgroundColor: '#AC1D10', borderRadius: 8, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontSize: 13, fontWeight: '700', color: '#FFF' },
});
