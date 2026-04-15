import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AddOnCard,
  CartItem,
  CheckoutBar,
  DeliveryAddress,
  OrderSummary,
  PaymentMethod,
  PromoInput,
  type CartItemModel,
} from '@/components/cart';
import {
  DEFAULT_DELIVERY_ADDRESS,
  DEFAULT_DELIVERY_FEE,
  DEFAULT_DISCOUNT,
  MOCK_ADD_ONS,
  MOCK_CART_ITEMS,
} from '@/constants/mock-cart-data';
import { usePayment } from '@/components/payment';

export default function CartScreen() {
  const params = useLocalSearchParams<{
    addressId?: string;
    addressLabel?: string;
    addressStreet?: string;
    addressFull?: string;
  }>();

  const [cartItems, setCartItems] = useState<CartItemModel[]>(MOCK_CART_ITEMS);
  const [promoCode, setPromoCode] = useState('');
  const { preferredPayment } = usePayment();

  // Use address from navigation params if available, otherwise use default
  const currentAddress = useMemo(() => {
    if (params.addressId) {
      return {
        label: 'Delivering to',
        address: `123 Quezon Avenue, Unit 4B,...`,
        fullAddress: params.addressFull ?? '',
        id: params.addressId,
      };
    }
    return {
      label: 'Delivering to',
      address: '123 Quezon Avenue, Unit 4B,...',
      fullAddress: DEFAULT_DELIVERY_ADDRESS.fullAddress,
      id: DEFAULT_DELIVERY_ADDRESS.id,
    };
  }, [params.addressId, params.addressFull]);

  const itemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

  const total = Math.max(0, subtotal + DEFAULT_DELIVERY_FEE - DEFAULT_DISCOUNT);

  const handleIncreaseQuantity = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecreaseQuantity = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleChangeAddress = () => {
    router.push({
      pathname: '/delivery-address',
      params: { selectedId: currentAddress.id },
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
          {/* Delivery address card with map */}
          <DeliveryAddress
            label={currentAddress.label}
            address={currentAddress.address}
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
              <Text style={styles.emptyText}>Your cart is empty</Text>
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

          {/* Complete Your Meal */}
          <Text style={styles.completeTitle}>Complete Your Meal</Text>

          <FlatList
            horizontal
            data={MOCK_ADD_ONS}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.addOnList}
            renderItem={({ item }) => (
              <AddOnCard item={item} onAdd={() => {}} />
            )}
          />

          {/* Spacer so content doesn't hide behind the bottom sheet */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* ── Bottom Sheet ── */}
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
            onApply={() => {}}
          />

          <OrderSummary
            subtotal={subtotal}
            deliveryFee={DEFAULT_DELIVERY_FEE}
            discount={DEFAULT_DISCOUNT}
          />

          <CheckoutBar
            total={total}
            onPress={() => router.push('/checkout')}
          />
        </View>
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
  emptyText: {
    textAlign: 'center',
    color: '#7A7A7A',
    fontSize: 14,
    paddingVertical: 24,
  },

  /* ── Complete Your Meal ── */
  completeTitle: {
    marginTop: 18,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  addOnList: {
    gap: 10,
    paddingRight: 10,
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
