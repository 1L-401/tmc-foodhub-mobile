import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

import type { MenuItem, MenuItemVariation, MenuItemAddon } from '@/src/features/browse/api/useRestaurantMenu';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

/* ── Helpers ── */
function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return path.startsWith('http') ? path : `https://foodhub.tmc-innovations.com${path}`;
}

/* ── Props ── */
interface MenuItemModalProps {
  visible: boolean;
  item: MenuItem | null;
  restaurantId: string | number;
  restaurantName: string;
  onClose: () => void;
  onAddToCart: (payload: {
    item: MenuItem;
    selectedVariation: { name: string; price: number } | undefined;
    selectedAddons: { name: string; price: number }[];
    quantity: number;
    computedPrice: number;
  }) => void;
}

export function MenuItemModal({
  visible,
  item,
  restaurantId,
  restaurantName,
  onClose,
  onAddToCart,
}: MenuItemModalProps) {
  const [selectedVariationIdx, setSelectedVariationIdx] = useState<number>(0);
  const [selectedAddonIds, setSelectedAddonIds] = useState<Set<number>>(new Set());
  const [quantity, setQuantity] = useState(1);

  // Reset state when item changes
  React.useEffect(() => {
    if (item) {
      setSelectedVariationIdx(0);
      setSelectedAddonIds(new Set());
      setQuantity(1);
    }
  }, [item?.id]);

  const variations: MenuItemVariation[] = item?.variations ?? [];
  const addons: MenuItemAddon[] = item?.add_ons ?? [];
  const hasVariations = variations.length > 0;
  const hasAddons = addons.length > 0;

  /* ── Price computation ── */
  const basePrice = Number(item?.price ?? 0);

  const selectedVariation = hasVariations ? variations[selectedVariationIdx] : undefined;
  const variationPrice = selectedVariation ? Number(selectedVariation.price) : 0;

  // If the first variation's price equals the base price, additional variations are relative to it
  const effectiveBasePrice = hasVariations ? variationPrice : basePrice;

  const addonTotal = useMemo(() => {
    let total = 0;
    selectedAddonIds.forEach((idx) => {
      if (addons[idx]) total += Number(addons[idx].price);
    });
    return total;
  }, [selectedAddonIds, addons]);

  const lineTotal = (effectiveBasePrice + addonTotal) * quantity;

  /* ── Handlers ── */
  const toggleAddon = useCallback((idx: number) => {
    setSelectedAddonIds((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const handleAdd = useCallback(() => {
    if (!item) return;
    const chosenAddons = Array.from(selectedAddonIds).map((idx) => ({
      name: addons[idx].name,
      price: Number(addons[idx].price),
    }));
    onAddToCart({
      item,
      selectedVariation: selectedVariation
        ? { name: selectedVariation.name, price: Number(selectedVariation.price) }
        : undefined,
      selectedAddons: chosenAddons,
      quantity,
      computedPrice: effectiveBasePrice,
    });
    onClose();
  }, [item, selectedVariation, selectedAddonIds, addons, quantity, effectiveBasePrice, onAddToCart, onClose]);

  if (!item) return null;

  const imgUrl = getImageUrl(item.image);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Animated.View entering={FadeIn.duration(200)} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View entering={SlideInDown.springify().damping(20)} style={styles.sheet}>
        {/* Close button */}
        <Pressable style={styles.closeBtn} onPress={onClose}>
          <MaterialCommunityIcons name="close" size={22} color="#333" />
        </Pressable>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
        >
          {/* Item Image */}
          <View style={styles.imageWrap}>
            {imgUrl ? (
              <Image source={{ uri: imgUrl }} style={styles.itemImage} contentFit="contain" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialCommunityIcons name="food" size={48} color="#DDD" />
              </View>
            )}
          </View>

          {/* Title & Description */}
          <Text style={styles.itemTitle}>{item.title}</Text>
          {item.description ? (
            <Text style={styles.itemDesc}>{item.description}</Text>
          ) : null}
          <Text style={styles.startingPrice}>Starting at ₱{basePrice.toFixed(2)}</Text>

          {/* ── VARIATIONS ── */}
          {hasVariations && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Variations</Text>
                <Text style={styles.requiredBadge}>REQUIRED • CHOOSE 1</Text>
              </View>

              {variations.map((v, idx) => {
                const isSelected = idx === selectedVariationIdx;
                const priceDiff = Number(v.price) - basePrice;
                return (
                  <Pressable
                    key={v.id ?? idx}
                    style={styles.optionRow}
                    onPress={() => setSelectedVariationIdx(idx)}
                  >
                    <View style={styles.radioRow}>
                      <View style={[styles.radioOuter, isSelected && styles.radioOuterActive]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      <Text style={[styles.optionName, isSelected && styles.optionNameActive]}>
                        {v.name}
                      </Text>
                    </View>
                    {priceDiff > 0 && (
                      <Text style={styles.optionPrice}>+₱{priceDiff.toFixed(2)}</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* ── ADD-ONS ── */}
          {hasAddons && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Frequently Added</Text>
                <Text style={styles.optionalBadge}>OPTIONAL</Text>
              </View>

              {addons.map((a, idx) => {
                const isChecked = selectedAddonIds.has(idx);
                return (
                  <Pressable
                    key={a.id ?? idx}
                    style={styles.optionRow}
                    onPress={() => toggleAddon(idx)}
                  >
                    <View style={styles.radioRow}>
                      <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
                        {isChecked && (
                          <MaterialCommunityIcons name="check" size={14} color="#FFF" />
                        )}
                      </View>
                      <Text style={[styles.optionName, isChecked && styles.optionNameActive]}>
                        {a.name}
                      </Text>
                    </View>
                    <Text style={styles.optionPrice}>+₱{Number(a.price).toFixed(2)}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Spacer for bottom bar */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* ── Bottom Bar ── */}
        <View style={styles.bottomBar}>
          {/* Quantity Selector */}
          <View style={styles.qtyWrap}>
            <Pressable
              style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
              disabled={quantity <= 1}
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <MaterialCommunityIcons name="minus" size={18} color={quantity <= 1 ? '#BBB' : '#333'} />
            </Pressable>
            <Text style={styles.qtyText}>{quantity}</Text>
            <Pressable
              style={styles.qtyBtn}
              onPress={() => setQuantity((q) => q + 1)}
            >
              <MaterialCommunityIcons name="plus" size={18} color="#333" />
            </Pressable>
          </View>

          {/* Add to Cart Button */}
          <Pressable style={styles.addToCartBtn} onPress={handleAdd}>
            <Text style={styles.addToCartText}>Add to Cart</Text>
            <View style={styles.priceChip}>
              <Text style={styles.priceChipText}>₱{lineTotal.toFixed(2)}</Text>
            </View>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}

/* ═══════════ STYLES ═══════════ */
const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_H * 0.88,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    left: 14,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  imageWrap: {
    alignSelf: 'center',
    width: SCREEN_W * 0.55,
    height: SCREEN_W * 0.4,
    marginBottom: 16,
    marginTop: 20,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
    marginBottom: 8,
  },
  startingPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
  },

  /* Sections */
  section: {
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  requiredBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#AC1D10',
    letterSpacing: 0.3,
  },
  optionalBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
    backgroundColor: '#F3F3F3',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },

  /* Option Row */
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionName: {
    fontSize: 15,
    color: '#444',
    fontWeight: '500',
  },
  optionNameActive: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  optionPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },

  /* Radio */
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: '#AC1D10',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#AC1D10',
  },

  /* Checkbox */
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#AC1D10',
    borderColor: '#AC1D10',
  },

  /* Bottom Bar */
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFF',
  },
  qtyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnDisabled: {
    opacity: 0.4,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    minWidth: 20,
    textAlign: 'center',
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B1410',
    height: 48,
    borderRadius: 14,
    gap: 10,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  priceChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
});
