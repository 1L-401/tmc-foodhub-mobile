import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { CheckoutPaymentOption } from '@/components/checkout';
import {
  CheckoutHeader,
  CheckoutSelectionItem,
  CheckoutTotalsCard,
  DeliveryAddressCard,
  PaymentOptionRow,
  PlaceOrderSection,
  SpecialInstructionsInput,
} from '@/components/checkout';
import {
  CHECKOUT_DELIVERY_ADDRESS,
  CHECKOUT_DELIVERY_FEE,
  CHECKOUT_DISCOUNT,
  CHECKOUT_ITEMS,
  CHECKOUT_PAYMENT_OPTIONS,
  CHECKOUT_SPECIAL_INSTRUCTIONS_PLACEHOLDER,
  CHECKOUT_SUBTOTAL,
  CHECKOUT_TOTAL,
} from '@/constants/mock-checkout-data';

export default function CheckoutScreen() {
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>(
    CHECKOUT_PAYMENT_OPTIONS[0]?.id ?? 'gcash'
  );

  const itemCount = useMemo(
    () => CHECKOUT_ITEMS.reduce((total, item) => total + item.quantity, 0),
    []
  );

  const handleSelectPayment = (option: CheckoutPaymentOption) => {
    setSelectedPaymentId(option.id);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <CheckoutHeader
            title="Delivery to"
            onBack={() => router.back()}
            onChange={() => {}}
          />

          <DeliveryAddressCard address={CHECKOUT_DELIVERY_ADDRESS} />

          <SpecialInstructionsInput
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            placeholder={CHECKOUT_SPECIAL_INSTRUCTIONS_PLACEHOLDER}
          />

          <View style={styles.selectionHeader}>
            <Text style={styles.sectionTitle}>Your selection</Text>
            <View style={styles.itemsBadge}>
              <Text style={styles.itemsBadgeText}>
                {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
              </Text>
            </View>
          </View>

          <View style={styles.selectionList}>
            {CHECKOUT_ITEMS.map((item, index) => (
              <View key={item.id} style={index > 0 ? styles.selectionDivider : undefined}>
                <CheckoutSelectionItem item={item} />
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Payment method</Text>

          <View style={styles.paymentList}>
            {CHECKOUT_PAYMENT_OPTIONS.map((option) => (
              <PaymentOptionRow
                key={option.id}
                option={option}
                selected={selectedPaymentId === option.id}
                onPress={() => handleSelectPayment(option)}
              />
            ))}
          </View>

          <CheckoutTotalsCard
            subtotal={CHECKOUT_SUBTOTAL}
            deliveryFee={CHECKOUT_DELIVERY_FEE}
            discount={CHECKOUT_DISCOUNT}
            total={CHECKOUT_TOTAL}
          />

          <PlaceOrderSection onPress={() => {}} />
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 22,
  },
  selectionHeader: {
    marginTop: 18,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    marginTop: 18,
    marginBottom: 9,
    fontSize: 31,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  itemsBadge: {
    borderRadius: 999,
    backgroundColor: '#FBE7E4',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  itemsBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#AC1D10',
  },
  selectionList: {
    marginTop: -2,
  },
  selectionDivider: {
    borderTopWidth: 1,
    borderColor: '#E9E9E9',
  },
  paymentList: {
    marginTop: 0,
    gap: 10,
  },
});
