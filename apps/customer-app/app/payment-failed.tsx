import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCart } from '@/components/cart';
import { usePayment } from '@/components/payment';

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

export default function PaymentFailedScreen() {
  const { activeOrder, total } = useCart();
  const { selectedPayment } = usePayment();

  const orderTotal = activeOrder?.total ?? total;
  const paymentLabel = activeOrder?.paymentMethod.label ?? selectedPayment.label;
  const paymentSubtitle = activeOrder?.paymentMethod.subtitle ?? selectedPayment.subtitle;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.contentWrap}>
          <View style={styles.statusIconWrap}>
            <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#D6982F" />
          </View>

          <Text style={styles.title}>Transaction Declined</Text>
          <Text style={styles.subtitle}>
            We&apos;re sorry, but your payment couldn&apos;t be processed. It&apos;s likely a temporary hiccup with your wallet. Don&apos;t worry, your cart is safe.
          </Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Order Total</Text>
              <Text style={styles.summaryValue}>{formatPrice(orderTotal)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Payment Method</Text>
              <View style={styles.methodValueWrap}>
                <MaterialCommunityIcons name="credit-card-outline" size={14} color="#444444" />
                <Text style={styles.summaryValue}>
                  {paymentLabel} {paymentSubtitle}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.reasonRow}>
              <MaterialCommunityIcons name="alert-circle" size={12} color="#2D2D2D" />
              <Text style={styles.reasonText}>
                Your bank might have declined this for security reasons or insufficient funds. Please check your account or try a different card.
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.replace('/checkout')}>
            <Text style={styles.retryText}>Retry Payment</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.changePaymentButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.push('/add-payment-method')}>
            <Text style={styles.changePaymentText}>Change Payment Method</Text>
          </Pressable>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerMuted}>Need help? </Text>
          <Text style={styles.footerLink}>Contact Support</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  contentWrap: {
    paddingTop: 90,
  },
  statusIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3EBD8',
  },
  title: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 34,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 38,
  },
  subtitle: {
    marginTop: 8,
    textAlign: 'center',
    color: '#666666',
    fontSize: 12,
    lineHeight: 18,
  },
  summaryCard: {
    marginTop: 16,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#DCDCDC',
    backgroundColor: '#F6F6F6',
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  methodValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E2E2',
    marginVertical: 2,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  reasonText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: '#666666',
  },
  retryButton: {
    marginTop: 16,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#AC1D10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  changePaymentButton: {
    marginTop: 8,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    backgroundColor: '#ECECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePaymentText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 6,
  },
  footerMuted: {
    fontSize: 11,
    color: '#8A8A8A',
  },
  footerLink: {
    fontSize: 11,
    color: '#AC1D10',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.84,
  },
});
