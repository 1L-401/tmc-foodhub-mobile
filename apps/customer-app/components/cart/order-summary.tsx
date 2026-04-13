import { StyleSheet, Text, View } from 'react-native';

interface OrderSummaryProps {
  subtotal: number;
  deliveryFee: number;
  discount: number;
}

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

export function OrderSummary({ subtotal, deliveryFee, discount }: OrderSummaryProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Subtotal</Text>
        <Text style={styles.value}>{formatPrice(subtotal)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Delivery Fee</Text>
        <Text style={styles.value}>{formatPrice(deliveryFee)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.discountLabel}>Discount (PROMO5)</Text>
        <Text style={styles.discountValue}>-{formatPrice(discount)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    color: '#777777',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A4A4A',
  },
  discountLabel: {
    fontSize: 15,
    color: '#AC1D10',
  },
  discountValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#AC1D10',
  },
});
