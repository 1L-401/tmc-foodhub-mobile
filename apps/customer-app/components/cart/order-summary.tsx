import { StyleSheet, Text, View } from 'react-native';

interface OrderSummaryProps {
  subtotal: number;
  deliveryFee: number;
  discount: number;
}

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

export function OrderSummary({
  subtotal,
  deliveryFee,
  discount,
}: OrderSummaryProps) {
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
    marginTop: 14,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#777777',
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  discountLabel: {
    fontSize: 14,
    color: '#AC1D10',
  },
  discountValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#AC1D10',
  },
});
