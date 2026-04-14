import { Pressable, StyleSheet, Text, View } from 'react-native';

import GCashIcon from '@/assets/images/GCash_idOP67IR4D_0.svg';

interface PaymentMethodProps {
  method: string;
  onChange: () => void;
}

export function PaymentMethod({ method, onChange }: PaymentMethodProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <View style={styles.iconWrap}>
          <GCashIcon width={18} height={18} />
        </View>
        <Text style={styles.methodText}>{method}</Text>
      </View>

      <Pressable style={({ pressed }) => [styles.changeButton, pressed && styles.pressed]} onPress={onChange}>
        <Text style={styles.changeText}>Change</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    backgroundColor: '#EFEFEF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E3E3',
  },
  methodText: {
    fontSize: 14,
    fontWeight: '600',
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
