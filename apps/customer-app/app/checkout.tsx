import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCart } from '@/components/cart';
import { PaymentOptionRow, type CheckoutPaymentId } from '@/components/checkout';
import { usePayment } from '@/components/payment';
import {
  CHECKOUT_SPECIAL_INSTRUCTIONS_PLACEHOLDER,
} from '@/constants/mock-checkout-data';

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

export default function CheckoutScreen() {
  const {
    cartItems,
    itemCount,
    selectedAddress,
    promoCode,
    subtotal,
    deliveryFee,
    appliedDiscount,
    total,
    specialInstructions,
    setSpecialInstructions,
    placeOrderFromCart,
  } = useCart();
  const {
    checkoutPaymentOptions,
    selectedPaymentId,
    selectedPayment,
    selectPaymentForOrder,
  } = usePayment();

  const handleSelectPayment = (methodId: CheckoutPaymentId) => {
    selectPaymentForOrder(methodId);
  };

  const handlePlaceOrder = () => {
    if (!cartItems.length) {
      return;
    }

    const order = placeOrderFromCart(selectedPayment);
    router.push({
      pathname: '/order-processing',
      params: { orderId: order.id },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
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
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* ── Delivery to ── */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>Delivery to</Text>
            <Pressable
              style={({ pressed }) => [pressed && styles.pressed]}
              onPress={() =>
                router.push('/delivery-address')
              }>
              <Text style={styles.changeText}>Change</Text>
            </Pressable>
          </View>

          {/* Address card with map */}
          <View style={styles.addressCard}>
            <View style={styles.mapContainer}>
              <Image
                source={{
                  uri: 'https://api.mapbox.com/styles/v1/mapbox/light-v11/static/121.0437,14.6349,15,0/400x180@2x?access_token=pk.placeholder',
                }}
                style={styles.mapImage}
                defaultSource={{
                  uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
                }}
              />
              <View style={styles.mapOverlay} />
              <View style={styles.pinContainer}>
                <View style={styles.pinDot} />
                <View style={styles.pinShadow} />
              </View>
            </View>
            <View style={styles.addressInfoRow}>
              <View style={styles.addressIcon}>
                <MaterialCommunityIcons
                  name="home"
                  size={16}
                  color="#AC1D10"
                />
              </View>
              <View style={styles.addressTexts}>
                <Text style={styles.addressTitle}>Home Address</Text>
                <Text style={styles.addressSub} numberOfLines={1}>
                  {selectedAddress.fullAddress}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Special Instructions ── */}
          <Text style={styles.fieldLabel}>Special Instructions</Text>
          <View style={styles.instructionsWrap}>
            <TextInput
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              placeholder={CHECKOUT_SPECIAL_INSTRUCTIONS_PLACEHOLDER}
              placeholderTextColor="#B2B2B2"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              style={styles.instructionsInput}
            />
          </View>

          {/* ── Your selection ── */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>Your selection</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
              </Text>
            </View>
          </View>

          {/* Items */}
          {cartItems.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.selectionItem,
                index > 0 && styles.selectionDivider,
              ]}>
              <Image
                source={{ uri: item.image }}
                style={styles.itemImage}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDesc}>{item.description}</Text>
                <View style={styles.qtyPill}>
                  <Text style={styles.qtyText}>Qty: {item.quantity}</Text>
                </View>
              </View>
              <Text style={styles.itemPrice}>
                {formatPrice(item.price)}
              </Text>
            </View>
          ))}

          {/* ── Payment method ── */}
          <Text style={styles.paymentTitle}>Payment method</Text>

          {checkoutPaymentOptions.map((option) => (
            <PaymentOptionRow
              key={option.id}
              option={option}
              selected={selectedPaymentId === option.id}
              onPress={() => handleSelectPayment(option.id)}
            />
          ))}

          {/* ── Totals ── */}
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>
                {formatPrice(subtotal)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Delivery Fee</Text>
              <Text style={styles.totalValue}>
                {formatPrice(deliveryFee)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Discount{promoCode.trim() ? ` (${promoCode.trim().toUpperCase()})` : ''}
              </Text>
              <Text style={styles.totalValue}>
                -{formatPrice(appliedDiscount)}
              </Text>
            </View>
            <View style={styles.totalRowBold}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>
                {formatPrice(total)}
              </Text>
            </View>
          </View>

          {/* ── Place Order ── */}
          <Pressable
            style={({ pressed }) => [
              styles.placeOrderBtn,
              !cartItems.length && styles.placeOrderBtnDisabled,
              pressed && cartItems.length > 0 && styles.placeOrderPressed,
            ]}
            disabled={!cartItems.length}
            onPress={handlePlaceOrder}>
            <Text style={styles.placeOrderText}>Place Order</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="#FFFFFF"
            />
          </Pressable>

          {/* ── Legal ── */}
          <Text style={styles.legalText}>
            By placing an order, you agree to TMC Foodhub&apos;s
          </Text>
          <View style={styles.legalRow}>
            <Text style={styles.legalLink}>Terms and Conditions</Text>
            <Text style={styles.legalText}> and </Text>
            <Text style={styles.legalLink}>Privacy Policy</Text>
            <Text style={styles.legalText}>.</Text>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
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
  headerSpacer: { width: 32 },

  /* ── Scroll ── */
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
  },

  /* ── Shared ── */
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#AC1D10',
  },
  badge: {
    backgroundColor: '#FBE7E4',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#AC1D10',
  },

  /* ── Address Card ── */
  addressCard: {
    borderRadius: 14,
    backgroundColor: '#EFEFEF',
    overflow: 'hidden',
    marginBottom: 16,
  },
  mapContainer: {
    height: 110,
    backgroundColor: '#E8E4DF',
    position: 'relative',
    overflow: 'hidden',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.3,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(235, 231, 226, 0.55)',
  },
  pinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -8,
    marginTop: -16,
    alignItems: 'center',
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#AC1D10',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  pinShadow: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(172, 29, 16, 0.2)',
    marginTop: 1,
  },
  addressInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  addressIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#F7E8E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressTexts: { flex: 1 },
  addressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 1,
  },
  addressSub: {
    fontSize: 12,
    color: '#777',
  },

  /* ── Special Instructions ── */
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  instructionsWrap: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 18,
    minHeight: 60,
  },
  instructionsInput: {
    fontSize: 13,
    color: '#1A1A1A',
    lineHeight: 20,
  },

  /* ── Selection Items ── */
  selectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  selectionDivider: {
    borderTopWidth: 1,
    borderTopColor: '#EBEBEB',
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
  },
  itemInfo: { flex: 1 },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 1,
  },
  itemDesc: {
    fontSize: 12,
    color: '#8D8D8D',
    marginBottom: 3,
  },
  qtyPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  qtyText: {
    fontSize: 11,
    color: '#888',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#AC1D10',
  },

  /* ── Payment Method ── */
  paymentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 18,
    marginBottom: 10,
  },
  /* ── Totals ── */
  totals: {
    marginTop: 16,
    gap: 6,
    marginBottom: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    color: '#888',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  totalRowBold: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  grandTotalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
  },

  /* ── Place Order ── */
  placeOrderBtn: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#AC1D10',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 16,
  },
  placeOrderPressed: {
    opacity: 0.88,
  },
  placeOrderBtnDisabled: {
    opacity: 0.55,
  },
  placeOrderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* ── Legal ── */
  legalText: {
    marginTop: 12,
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  legalLink: {
    fontSize: 11,
    color: '#1A1A1A',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },

  pressed: { opacity: 0.7 },
});
