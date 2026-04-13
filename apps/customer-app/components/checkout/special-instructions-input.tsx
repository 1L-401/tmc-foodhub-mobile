import { StyleSheet, Text, TextInput, View } from 'react-native';

interface SpecialInstructionsInputProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}

export function SpecialInstructionsInput({
  value,
  onChangeText,
  placeholder,
}: SpecialInstructionsInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Special Instructions</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#B2B2B2"
        multiline
        numberOfLines={2}
        textAlignVertical="top"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1A',
  },
});
