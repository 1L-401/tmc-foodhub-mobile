import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface CheckoutHeaderProps {
  title: string;
  onBack: () => void;
  onChange: () => void;
}

export function CheckoutHeader({ title, onBack, onChange }: CheckoutHeaderProps) {
  return (
    <View style={styles.container}>
      <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.pressed]} onPress={onBack}>
        <MaterialCommunityIcons name="chevron-left" size={24} color="#1A1A1A" />
      </Pressable>

      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        <Pressable style={({ pressed }) => [styles.changeButton, pressed && styles.pressed]} onPress={onChange}>
          <Text style={styles.changeText}>Change</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  backButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -6,
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 31,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  changeButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#AC1D10',
  },
  pressed: {
    opacity: 0.75,
  },
});
