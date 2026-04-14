import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface PromoInputProps {
  value: string;
  onChangeText: (value: string) => void;
  onApply: () => void;
}

export function PromoInput({ value, onChangeText, onApply }: PromoInputProps) {
  return (
    <View style={styles.container}>
      <View style={styles.inputWrap}>
        <MaterialCommunityIcons
          name="ticket-percent-outline"
          size={16}
          color="#C98C6F"
        />
        <TextInput
          style={styles.input}
          placeholder="Promo Code"
          placeholderTextColor="#A0A0A0"
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="characters"
        />
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.applyButton,
          pressed && styles.pressed,
        ]}
        onPress={onApply}>
        <Text style={styles.applyText}>Apply</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputWrap: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    paddingVertical: 0,
  },
  applyButton: {
    height: 42,
    borderRadius: 12,
    paddingHorizontal: 20,
    backgroundColor: '#AC1D10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});
