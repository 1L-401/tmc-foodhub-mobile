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

      <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={onPress}>
        <Text style={styles.buttonText}>Place Order</Text>
        <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#AC1D10',
    borderRadius: 12,
    height: 58,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.8,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  total: {
    fontSize: 27,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 31,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  buttonText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 32,
  },
  pressed: {
    opacity: 0.82,
  },
});
