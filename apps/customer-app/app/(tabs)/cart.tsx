import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  DEFAULT_PAYMENT_METHOD,
  MOCK_ADD_ONS,
  MOCK_CART_ITEMS,
} from '@/constants/mock-cart-data';

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItemModel[]>(MOCK_CART_ITEMS);
  const [promoCode, setPromoCode] = useState('');

  const itemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <DeliveryAddress
            label={DEFAULT_DELIVERY_ADDRESS.label}
            address={DEFAULT_DELIVERY_ADDRESS.address}
          />

          <View style={styles.cartHeaderRow}>
            <Text style={styles.cartTitle}>My Cart</Text>
            <Text style={styles.itemCountText}>
              {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
            </Text>
          </View>

          <View style={styles.cartItemsWrap}>
            {cartItems.length === 0 ? (
              <Text style={styles.emptyText}>Your cart is empty</Text>
            ) : (
              cartItems.map((item, index) => (
                <View
                  key={item.id}
                  style={index > 0 ? styles.cartItemDivider : undefined}>
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

          <Text style={styles.sectionTitle}>Complete Your Meal</Text>

          <FlatList
            horizontal
            data={MOCK_ADD_ONS}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.addOnListContent}
            renderItem={({ item }) => (
              <AddOnCard item={item} onAdd={() => {}} />
            )}
          />

          <PaymentMethod method={DEFAULT_PAYMENT_METHOD} onChange={() => {}} />

          <PromoInput value={promoCode} onChangeText={setPromoCode} onApply={() => {}} />

          <OrderSummary
            subtotal={subtotal}
            deliveryFee={DEFAULT_DELIVERY_FEE}
            discount={DEFAULT_DISCOUNT}
          />

          <View style={styles.checkoutSpacer} />
        </ScrollView>

        <View style={styles.checkoutStickyWrap}>
          <CheckoutBar total={total} onPress={() => {}} />
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  cartHeaderRow: {
    marginTop: 22,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartTitle: {
    fontSize: 33,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  itemCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#AC1D10',
    backgroundColor: '#FBE7E4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  cartItemsWrap: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECECEC',
    paddingHorizontal: 10,
  },
  cartItemDivider: {
    borderTopWidth: 1,
    borderColor: '#F0F0F0',
  },
  emptyText: {
    textAlign: 'center',
    color: '#7A7A7A',
    fontSize: 15,
    paddingVertical: 26,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 31,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  addOnListContent: {
    gap: 10,
    paddingRight: 10,
  },
  checkoutSpacer: {
    height: 112,
  },
  checkoutStickyWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
  },
});
