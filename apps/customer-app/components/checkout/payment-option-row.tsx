import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import GCashIcon from '@/assets/images/GCash_idOP67IR4D_0.svg';
import type { CheckoutPaymentOption } from '@/components/checkout/types';

interface PaymentOptionRowProps {
  option: CheckoutPaymentOption;
  selected: boolean;
  onPress: () => void;
}

export function PaymentOptionRow({ option, selected, onPress }: PaymentOptionRowProps) {
  const icon =
    option.icon === 'gcash' ? (
      <GCashIcon width={20} height={20} />
    ) : (
      <MaterialCommunityIcons name="cash-multiple" size={20} color="#8A8A8A" />
    );

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        selected && styles.containerSelected,
        pressed && styles.pressed,
      ]}
      onPress={onPress}>
      <View style={styles.leftContent}>
        <View style={styles.iconWrap}>{icon}</View>

        <View style={styles.copyWrap}>
          <Text style={styles.label}>{option.label}</Text>
          <Text style={styles.subtitle}>{option.subtitle}</Text>
        </View>
      </View>

      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    backgroundColor: '#EFEFEF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  containerSelected: {
    borderColor: '#AC1D10',
    backgroundColor: '#F8F5F4',
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
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E3E3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyWrap: {
    flex: 1,
  },
  label: {
    fontSize: 21,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 1,
  },
  subtitle: {
    fontSize: 12,
    color: '#888888',
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioOuterSelected: {
    borderColor: '#AC1D10',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#AC1D10',
  },
  pressed: {
    opacity: 0.82,
  },
});
