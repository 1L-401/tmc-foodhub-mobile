import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { CheckoutAddress } from './types';

interface DeliveryAddressCardProps {
  address: CheckoutAddress;
}

export function DeliveryAddressCard({ address }: DeliveryAddressCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name="home-outline" size={16} color="#AC1D10" />
      </View>

      <View style={styles.copyWrap}>
        <Text style={styles.label}>{address.label}</Text>
        <Text style={styles.address}>{address.address}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EFEFEF',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  iconWrap: {
    width: 31,
    height: 31,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7E8E6',
  },
  copyWrap: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: '#9A9A9A',
    fontSize: 12,
    fontWeight: '500',
  },
  address: {
    color: '#1A1A1A',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
});
