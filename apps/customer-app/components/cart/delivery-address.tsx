import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

interface DeliveryAddressProps {
  label: string;
  address: string;
  onChangePress?: () => void;
}

export function DeliveryAddress({ label, address, onChangePress }: DeliveryAddressProps) {
  return (
    <View style={styles.container}>
      {/* Map Preview */}
      <View style={styles.mapContainer}>
        <Image
          source={{
            uri: 'https://api.mapbox.com/styles/v1/mapbox/light-v11/static/121.0437,14.6349,15,0/400x180@2x?access_token=pk.placeholder',
          }}
          style={styles.mapImage}
          defaultSource={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' }}
        />
        {/* Map Overlay - light grey background to simulate map */}
        <View style={styles.mapOverlay} />
        {/* Pin Icon */}
        <View style={styles.pinContainer}>
          <View style={styles.pinDot} />
          <View style={styles.pinShadow} />
        </View>
      </View>

      {/* Address Info Row */}
      <View style={styles.addressRow}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name="home" size={18} color="#AC1D10" />
        </View>
        <View style={styles.addressContent}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.address} numberOfLines={1}>
            {address}
          </Text>
        </View>
        {onChangePress && (
          <Pressable
            style={({ pressed }) => [styles.changeButton, pressed && styles.pressed]}
            onPress={onChangePress}>
            <Text style={styles.changeText}>Change</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    backgroundColor: '#EFEFEF',
    overflow: 'hidden',
  },
  mapContainer: {
    height: 130,
    backgroundColor: '#E8E4DF',
    position: 'relative',
    overflow: 'hidden',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.3,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(235, 231, 226, 0.55)',
  },
  pinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -8,
    marginTop: -20,
    alignItems: 'center',
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#AC1D10',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  pinShadow: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(172, 29, 16, 0.25)',
    marginTop: 2,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F7E8E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressContent: {
    flex: 1,
  },
  label: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  address: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '700',
  },
  changeButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  changeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#AC1D10',
  },
  pressed: {
    opacity: 0.75,
  },
});
