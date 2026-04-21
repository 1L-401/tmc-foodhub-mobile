import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  CartItem,
  CheckoutBar,
  DeliveryAddress,
  OrderSummary,
  PaymentMethod,
  PromoInput,
  useCart,
} from '@/components/cart';
import { usePayment } from '@/components/payment';

export default function CartScreen() {
  const {
    cartItems,
    promoCode,
    appliedDiscount,
    deliveryFee,
    itemCount,
    subtotal,
    total,
    selectedAddress,
    addressCoords,
    setPromoCode,
    applyPromoCode,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
  } = useCart();
  const { preferredPayment } = usePayment();

  const handleIncreaseQuantity = (id: string) => {
    increaseQuantity(id);
  };

  const handleDecreaseQuantity = (id: string) => {
    decreaseQuantity(id);
  };

  const handleDeleteItem = (id: string) => {
    removeItem(id);
  };

  const handleChangeAddress = () => {
    router.push({
      pathname: '/delivery-address',
      params: { selectedId: selectedAddress.id },
    });
  };

  const handleChangePaymentMethod = () => {
    router.push('/add-payment-method');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backBtn,
              pressed && styles.pressed,
            ]}
            onPress={() => router.back()}>
            <MaterialCommunityIcons
              name="chevron-left"
              size={26}
              color="#1A1A1A"
            />
          </Pressable>
          <Text style={styles.headerTitle}>My Cart</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* ── Scrollable Content ── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Delivery address card with real map */}
          <DeliveryAddress
              label={`Delivering to ${selectedAddress.label}`}
              address={selectedAddress.fullAddress}
              latitude={addressCoords?.latitude}
              longitude={addressCoords?.longitude}
              onChangePress={handleChangeAddress}
          />

          {/* My Cart heading */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>My Cart</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
              </Text>
            </View>
          </View>

          {/* Cart items card */}
          <View style={styles.itemsCard}>
            {cartItems.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="cart-outline" size={48} color="#D0D0D0" />
                <Text style={styles.emptyTitle}>Your cart is empty</Text>
                <Text style={styles.emptySubtext}>
                  Browse restaurants and add items to get started
                </Text>
                <Pressable
                  style={({ pressed }) => [styles.browseBtn, pressed && styles.pressed]}
                  onPress={() => router.push('/(tabs)')}>
                  <Text style={styles.browseBtnText}>Browse Restaurants</Text>
                </Pressable>
              </View>
            ) : (
              cartItems.map((item, index) => (
                <View
                  key={item.id}
                  style={index > 0 ? styles.itemDivider : undefined}>
                  <CartItem
                    item={item}
                    onIncrease={() => handleIncreaseQuantity(item.id)}
                    onDecrease={() => handleDecreaseQuantity(item.id)}
                    onDelete={() => handleDeleteItem(item.id)}
                    onEditOptions={() => {}}
                  />
                </View>
              ))
            )}
          </View>

          {/* Spacer so content doesn't hide behind the bottom sheet */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* ── Bottom Sheet ── */}
        {cartItems.length > 0 && (
          <View style={styles.bottomSheet}>
            <PaymentMethod
              icon={preferredPayment.icon}
              label={preferredPayment.label}
              subtitle={preferredPayment.subtitle}
              onChange={handleChangePaymentMethod}
            />

            <PromoInput
              value={promoCode}
              onChangeText={setPromoCode}
              onApply={applyPromoCode}
            />

            <OrderSummary
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              discount={appliedDiscount}
            />

            <CheckoutBar
              total={total}
              onPress={() => router.push('/checkout')}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  container: {
    flex: 1,
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSpacer: {
    width: 32,
  },

  /* ── Scroll Content ── */
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },

  /* ── Section Row (My Cart + badge) ── */
  sectionRow: {
    marginTop: 18,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  badge: {
    backgroundColor: '#FBE7E4',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#AC1D10',
  },

  /* ── Items Card ── */
  itemsCard: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECECEC',
    paddingHorizontal: 10,
  },
  itemDivider: {
    borderTopWidth: 1,
    borderColor: '#F0F0F0',
  },

  /* ── Empty State ── */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#8A8A8A',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 19,
  },
  browseBtn: {
    backgroundColor: '#AC1D10',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* ── Bottom Spacer ── */
  bottomSpacer: {
    height: 280,
  },

  /* ── Bottom Sheet ── */
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },

  pressed: {
    opacity: 0.7,
  },
});
