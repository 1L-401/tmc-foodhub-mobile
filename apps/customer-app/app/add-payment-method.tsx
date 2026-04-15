import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import GCashIcon from '@/assets/images/GCash_idOP67IR4D_0.svg';
import { usePayment } from '@/components/payment';

type EditablePaymentMethod = 'gcash' | 'maya' | 'card';

function formatCardNumber(input: string) {
  const digits = input.replace(/\D/g, '').slice(0, 19);
  const groups = digits.match(/.{1,4}/g);
  return groups ? groups.join(' ') : '';
}

function formatExpiry(input: string) {
  const digits = input.replace(/\D/g, '').slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function isExpiryValid(expiryDate: string) {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiryDate);

  if (!match) {
    return false;
  }

  const month = Number(match[1]);
  const year = Number(match[2]);

  if (Number.isNaN(month) || Number.isNaN(year) || month < 1 || month > 12) {
    return false;
  }

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) {
    return false;
  }

  if (year === currentYear && month < currentMonth) {
    return false;
  }

  return true;
}

export default function AddPaymentMethodScreen() {
  const { preferredPaymentId, savedCard, saveCardMethod, saveWalletMethod } = usePayment();

  const [selectedMethod, setSelectedMethod] = useState<EditablePaymentMethod>(preferredPaymentId);
  const [cardNumber, setCardNumber] = useState(() =>
    savedCard ? formatCardNumber(savedCard.cardNumber) : ''
  );
  const [expiryDate, setExpiryDate] = useState(savedCard?.expiryDate ?? '');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState(savedCard?.cardholderName ?? '');
  const [saveForFutureOrders, setSaveForFutureOrders] = useState(true);

  const cardDigits = useMemo(() => cardNumber.replace(/\D/g, ''), [cardNumber]);

  const isCardNumberValid = cardDigits.length >= 13 && cardDigits.length <= 19;
  const isCardholderValid = cardholderName.trim().length >= 2;
  const isCvvValid = cvv.length >= 3 && cvv.length <= 4;
  const canSaveCard =
    isCardNumberValid && isCardholderValid && isCvvValid && isExpiryValid(expiryDate);
  const canSave = selectedMethod !== 'card' || canSaveCard;

  const cardPreviewNumber = cardDigits.length > 0
    ? `${cardDigits.slice(0, 4).padEnd(4, '•')} ${cardDigits.slice(4, 8).padEnd(4, '•')} ${cardDigits.slice(8, 12).padEnd(4, '•')} ${(cardDigits.slice(12, 16) || '').padEnd(4, '•')}`
    : '•••• •••• •••• ••••';

  const handleSave = () => {
    if (!canSave) {
      return;
    }

    if (selectedMethod === 'card') {
      saveCardMethod({
        cardNumber,
        expiryDate,
        cvv,
        cardholderName,
      });
    } else {
      saveWalletMethod(selectedMethod);
    }

    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.back()}>
            <MaterialCommunityIcons name="chevron-left" size={26} color="#1A1A1A" />
          </Pressable>
          <Text style={styles.headerTitle}>Add Payment Method</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>Secure Checkout</Text>
          <Text style={styles.sectionSubTitle}>
            Add a preferred payment method to enjoy a seamless culinary journey.
          </Text>

          <Text style={styles.overline}>QUICK LINK E-WALLETS</Text>
          <View style={styles.walletRow}>
            <Pressable
              style={({ pressed }) => [
                styles.walletButton,
                selectedMethod === 'gcash' && styles.walletButtonSelected,
                pressed && styles.pressed,
              ]}
              onPress={() => setSelectedMethod('gcash')}>
              <View style={styles.walletIconWrap}>
                <GCashIcon width={18} height={18} />
              </View>
              <Text style={styles.walletLabel}>GCash</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.walletButton,
                selectedMethod === 'maya' && styles.walletButtonSelected,
                pressed && styles.pressed,
              ]}
              onPress={() => setSelectedMethod('maya')}>
              <View style={styles.walletIconWrap}>
                <View style={styles.mayaBadge}>
                  <Text style={styles.mayaBadgeText}>M</Text>
                </View>
              </View>
              <Text style={styles.walletLabel}>Maya</Text>
            </Pressable>
          </View>

          <Text style={[styles.overline, styles.cardOverline]}>
            CREDIT CARD OR DEBIT CARD
          </Text>

          <Pressable
            style={[
              styles.cardPreview,
              selectedMethod === 'card' && styles.cardPreviewSelected,
            ]}
            onPress={() => setSelectedMethod('card')}>
            <View style={styles.cardPreviewTopRow}>
              <MaterialCommunityIcons
                name="credit-card-chip-outline"
                size={22}
                color="#F3D8CB"
              />
              <MaterialCommunityIcons name="contactless-payment" size={20} color="#F8EAE3" />
            </View>

            <Text style={styles.cardNumberPreview}>{cardPreviewNumber}</Text>

            <View style={styles.cardPreviewBottomRow}>
              <Text style={styles.cardHolderPreview}>
                {cardholderName.trim() ? cardholderName.trim().toUpperCase() : 'JANE DOE'}
              </Text>
              <Text style={styles.cardExpiryPreview}>{expiryDate || '12/31'}</Text>
            </View>
          </Pressable>

          <Text style={styles.fieldLabel}>Card Number</Text>
          <View style={styles.inputWrap}>
            <TextInput
              value={cardNumber}
              onFocus={() => setSelectedMethod('card')}
              onChangeText={(value) => {
                setSelectedMethod('card');
                setCardNumber(formatCardNumber(value));
              }}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor="#B0B0B0"
              keyboardType="number-pad"
              style={styles.inputInline}
              maxLength={23}
            />
            <MaterialCommunityIcons name="shield-check" size={16} color="#8B8B8B" />
          </View>

          <View style={styles.rowFields}>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>Expiry Date</Text>
              <TextInput
                value={expiryDate}
                onFocus={() => setSelectedMethod('card')}
                onChangeText={(value) => {
                  setSelectedMethod('card');
                  setExpiryDate(formatExpiry(value));
                }}
                placeholder="MM/YY"
                placeholderTextColor="#B0B0B0"
                keyboardType="number-pad"
                style={styles.input}
                maxLength={5}
              />
            </View>

            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>CVV</Text>
              <TextInput
                value={cvv}
                onFocus={() => setSelectedMethod('card')}
                onChangeText={(value) => {
                  setSelectedMethod('card');
                  setCvv(value.replace(/\D/g, '').slice(0, 4));
                }}
                placeholder="•••"
                placeholderTextColor="#B0B0B0"
                keyboardType="number-pad"
                secureTextEntry
                style={styles.input}
                maxLength={4}
              />
            </View>
          </View>

          <Text style={styles.fieldLabel}>Cardholder Name</Text>
          <TextInput
            value={cardholderName}
            onFocus={() => setSelectedMethod('card')}
            onChangeText={(value) => {
              setSelectedMethod('card');
              setCardholderName(value);
            }}
            placeholder="As it appears on the card"
            placeholderTextColor="#B0B0B0"
            autoCapitalize="words"
            style={styles.input}
          />

          <Pressable
            style={({ pressed }) => [
              styles.checkboxRow,
              pressed && styles.pressed,
            ]}
            onPress={() => setSaveForFutureOrders((prev) => !prev)}>
            <View
              style={[
                styles.checkbox,
                saveForFutureOrders && styles.checkboxSelected,
              ]}>
              {saveForFutureOrders ? (
                <MaterialCommunityIcons name="check" size={12} color="#FFFFFF" />
              ) : null}
            </View>
            <Text style={styles.checkboxText}>
              Save this payment method for future orders
            </Text>
          </Pressable>

          {selectedMethod === 'card' && !canSaveCard ? (
            <Text style={styles.validationText}>
              Enter a valid card number, expiry date, CVV, and cardholder name.
            </Text>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              !canSave && styles.saveButtonDisabled,
              pressed && canSave && styles.savePressed,
            ]}
            onPress={handleSave}
            disabled={!canSave}>
            <Text style={styles.saveButtonText}>Save Payment Method</Text>
          </Pressable>

          <Text style={styles.legalText}>
            By adding a payment method, you agree to TMC Foodhub&apos;s
          </Text>
          <View style={styles.legalRow}>
            <Text style={styles.legalLink}>Terms and Conditions</Text>
            <Text style={styles.legalText}> and </Text>
            <Text style={styles.legalLink}>Privacy Policy</Text>
            <Text style={styles.legalText}>.</Text>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backButton: {
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
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sectionSubTitle: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6E6E6E',
    marginBottom: 16,
  },
  overline: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A8A8A',
    marginBottom: 10,
  },
  walletRow: {
    flexDirection: 'row',
    gap: 10,
  },
  walletButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCDCDC',
    backgroundColor: '#F3F3F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 8,
  },
  walletButtonSelected: {
    borderColor: '#AC1D10',
    backgroundColor: '#FFF5F3',
  },
  walletIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E3E3',
  },
  mayaBadge: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mayaBadgeText: {
    fontSize: 9,
    color: '#7FFF6A',
    fontWeight: '800',
    lineHeight: 11,
  },
  walletLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  cardOverline: {
    marginTop: 18,
  },
  cardPreview: {
    borderRadius: 18,
    backgroundColor: '#C16F5B',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 14,
  },
  cardPreviewSelected: {
    borderWidth: 1.5,
    borderColor: '#AC1D10',
  },
  cardPreviewTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  cardNumberPreview: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  cardPreviewBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHolderPreview: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FDF7F3',
  },
  cardExpiryPreview: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F3DDD4',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  inputWrap: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#DCDCDC',
    borderRadius: 10,
    backgroundColor: '#EFEFEF',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inputInline: {
    flex: 1,
    fontSize: 13,
    color: '#1A1A1A',
    paddingVertical: 0,
    paddingRight: 8,
  },
  input: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#DCDCDC',
    borderRadius: 10,
    backgroundColor: '#EFEFEF',
    paddingHorizontal: 10,
    fontSize: 13,
    color: '#1A1A1A',
    marginBottom: 10,
  },
  rowFields: {
    flexDirection: 'row',
    gap: 10,
  },
  halfField: {
    flex: 1,
  },
  checkboxRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#B5B5B5',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    borderColor: '#AC1D10',
    backgroundColor: '#AC1D10',
  },
  checkboxText: {
    fontSize: 12,
    color: '#686868',
  },
  validationText: {
    marginTop: 6,
    fontSize: 12,
    color: '#AC1D10',
  },
  saveButton: {
    marginTop: 14,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#AC1D10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#D9B1AD',
  },
  savePressed: {
    opacity: 0.88,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  legalText: {
    marginTop: 10,
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
  pressed: {
    opacity: 0.8,
  },
});
