import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { CartItemModel } from './types';

interface CartItemProps {
  item: CartItemModel;
  onIncrease: () => void;
  onDecrease: () => void;
  onDelete: () => void;
  onEditOptions: () => void;
}

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

export function CartItem({ item, onIncrease, onDecrease, onDelete, onEditOptions }: CartItemProps) {
  const disableDecrease = item.quantity <= 1;

  return (
    <View style={styles.container}>
      <Image source={{ uri: item.image }} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.copyWrap}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Pressable onPress={onEditOptions}>
              <Text style={styles.editText}>Edit Options</Text>
            </Pressable>
          </View>
          <Text style={styles.price}>{formatPrice(item.price)}</Text>
        </View>

        <View style={styles.controlsRow}>
          <Pressable
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            onPress={onDelete}>
            <MaterialCommunityIcons name="trash-can-outline" size={16} color="#7A7A7A" />
          </Pressable>

          <View style={styles.quantityWrap}>
            <Pressable
              style={({ pressed }) => [
                styles.quantityButton,
                disableDecrease && styles.quantityButtonDisabled,
                pressed && !disableDecrease && styles.pressed,
              ]}
              disabled={disableDecrease}
              onPress={onDecrease}>
              <MaterialCommunityIcons name="minus" size={16} color={disableDecrease ? '#B8B8B8' : '#6A6A6A'} />
            </Pressable>

            <Text style={styles.quantityText}>{item.quantity}</Text>

            <Pressable
              style={({ pressed }) => [styles.quantityButtonPrimary, pressed && styles.pressed]}
              onPress={onIncrease}>
              <MaterialCommunityIcons name="plus" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#F2F2F2',
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  copyWrap: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: '#8A8A8A',
    marginBottom: 4,
  },
  editText: {
    fontSize: 12,
    color: '#AC1D10',
    textDecorationLine: 'underline',
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  controlsRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  quantityButtonPrimary: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#AC1D10',
  },
  quantityButtonDisabled: {
    backgroundColor: '#F6F6F6',
    borderColor: '#EBEBEB',
  },
  quantityText: {
    minWidth: 12,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  pressed: {
    opacity: 0.8,
  },
});
