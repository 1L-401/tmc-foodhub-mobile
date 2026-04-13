import { Image, StyleSheet, Text, View } from 'react-native';

import type { CartItemModel } from '@/components/cart';

interface CheckoutSelectionItemProps {
  item: CartItemModel;
}

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

export function CheckoutSelectionItem({ item }: CheckoutSelectionItemProps) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: item.image }} style={styles.image} />

      <View style={styles.copyWrap}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>

        <View style={styles.qtyChip}>
          <Text style={styles.qtyText}>Qty: {item.quantity}</Text>
        </View>
      </View>

      <Text style={styles.price}>{formatPrice(item.price)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  image: {
    width: 52,
    height: 52,
    borderRadius: 11,
    backgroundColor: '#F0F0F0',
  },
  copyWrap: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 1,
  },
  description: {
    fontSize: 13,
    color: '#8D8D8D',
    marginBottom: 4,
  },
  qtyChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFEFEF',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  qtyText: {
    fontSize: 11,
    color: '#888888',
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: '#AC1D10',
  },
});
