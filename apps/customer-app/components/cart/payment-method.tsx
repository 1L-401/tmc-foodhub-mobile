import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import GCashIcon from '@/assets/images/GCash_idOP67IR4D_0.svg';
import type { CheckoutPaymentIcon } from '@/components/checkout/types';

interface PaymentMethodProps {
  icon: CheckoutPaymentIcon;
  label: string;
  subtitle: string;
  onChange: () => void;
}

export function PaymentMethod({ icon, label, subtitle, onChange }: PaymentMethodProps) {
  const renderedIcon =
    icon === 'gcash' ? (
      <GCashIcon width={18} height={18} />
    ) : icon === 'maya' ? (
      <View style={styles.mayaBadge}>
        <Text style={styles.mayaBadgeText}>M</Text>
      </View>
    ) : icon === 'card' ? (
      <MaterialCommunityIcons name="credit-card-outline" size={18} color="#6F6F6F" />
    ) : (
      <MaterialCommunityIcons name="cash-multiple" size={18} color="#6F6F6F" />
    );

  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <View style={styles.iconWrap}>
          {renderedIcon}
        </View>

        <View style={styles.copyWrap}>
          <Text style={styles.methodText}>{label}</Text>
          <Text style={styles.methodSubText}>{subtitle}</Text>
        </View>
      </View>

      <Pressable style={({ pressed }) => [styles.changeButton, pressed && styles.pressed]} onPress={onChange}>
        <Text style={styles.changeText}>Change</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    backgroundColor: '#EFEFEF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E3E3',
  },
  copyWrap: {
    flex: 1,
  },
  methodText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  methodSubText: {
    fontSize: 12,
    color: '#8A8A8A',
    marginTop: 1,
  },
  mayaBadge: {
    width: 18,
    height: 18,
    borderRadius: 5,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mayaBadgeText: {
    fontSize: 10,
    color: '#7FFF6A',
    fontWeight: '800',
    lineHeight: 12,
  },
  changeButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#AC1D10',
  },
  pressed: {
    opacity: 0.75,
  },
});
