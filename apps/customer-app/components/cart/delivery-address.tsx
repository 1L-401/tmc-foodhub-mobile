import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

interface DeliveryAddressProps {
  label: string;
  address: string;
}

export function DeliveryAddress({ label, address }: DeliveryAddressProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name="home-outline" size={18} color="#AC1D10" />
      </View>
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.address}>{address}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EFEFEF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F7E8E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  address: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '700',
  },
});
