import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface CheckoutBarProps {
  total: number;
  onPress: () => void;
}

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

export function CheckoutBar({ total, onPress }: CheckoutBarProps) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.label}>CHECKOUT</Text>
        <Text style={styles.total}>{formatPrice(total)}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={onPress}>
        <Text style={styles.buttonText}>Place Order</Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#AC1D10',
    borderRadius: 14,
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  label: {
    fontSize: 9,
    letterSpacing: 0.8,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  total: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 4,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.82,
  },
});
