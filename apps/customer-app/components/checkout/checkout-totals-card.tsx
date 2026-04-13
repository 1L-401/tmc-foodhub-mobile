import { StyleSheet, Text, View } from 'react-native';

interface CheckoutTotalsCardProps {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

export function CheckoutTotalsCard({ subtotal, deliveryFee, discount, total }: CheckoutTotalsCardProps) {
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
        <Text style={styles.label}>Discount (PROMO5)</Text>
        <Text style={styles.value}>-{formatPrice(discount)}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatPrice(total)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    backgroundColor: '#EFEFEF',
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 15,
    color: '#777777',
  },
  value: {
    fontSize: 17,
    fontWeight: '700',
    color: '#5A5A5A',
  },
  divider: {
    height: 1,
    backgroundColor: '#D9D9D9',
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 29,
    fontWeight: '700',
    color: '#303030',
  },
  totalValue: {
    fontSize: 39,
    fontWeight: '800',
    color: '#AC1D10',
    lineHeight: 44,
  },
});
