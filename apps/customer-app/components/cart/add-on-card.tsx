import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { AddOnItem } from './types';

interface AddOnCardProps {
  item: AddOnItem;
  onAdd: () => void;
}

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

export function AddOnCard({ item, onAdd }: AddOnCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.image }} style={styles.image} />
      </View>
      <Text numberOfLines={1} style={styles.name}>
        {item.name}
      </Text>
      <Text style={styles.price}>{formatPrice(item.price)}</Text>

      <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={onAdd}>
        <Text style={styles.buttonText}>{`Add +$${item.price.toFixed(0)}`}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 126,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  imageWrap: {
    height: 84,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  price: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '700',
    color: '#AC1D10',
    marginBottom: 8,
  },
  button: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2A2A2A',
  },
});
