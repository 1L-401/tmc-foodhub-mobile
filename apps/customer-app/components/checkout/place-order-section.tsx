import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface PlaceOrderSectionProps {
  onPress: () => void;
}

export function PlaceOrderSection({ onPress }: PlaceOrderSectionProps) {
  return (
    <View style={styles.container}>
      <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={onPress}>
        <Text style={styles.buttonText}>Place Order</Text>
        <MaterialCommunityIcons name="chevron-right" size={18} color="#FFFFFF" />
      </Pressable>

      <Text style={styles.footerText}>By placing an order, you agree to TMC Foodhub&apos;s</Text>
      <View style={styles.linksRow}>
        <Text style={styles.linkText}>Terms and Conditions</Text>
        <Text style={styles.footerText}> and </Text>
        <Text style={styles.linkText}>Privacy Policy.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 22,
    marginBottom: 10,
  },
  button: {
    height: 58,
    borderRadius: 12,
    backgroundColor: '#AC1D10',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  buttonText: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 34,
  },
  footerText: {
    marginTop: 10,
    fontSize: 12,
    color: '#7E7E7E',
    textAlign: 'center',
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    marginTop: 3,
    fontSize: 12,
    color: '#AC1D10',
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.84,
  },
});
