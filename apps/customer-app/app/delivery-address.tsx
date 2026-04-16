import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCart, type AddressLabel } from '@/components/cart';

export default function DeliveryAddressScreen() {
  const { savedAddresses, selectedAddress, selectAddressById } = useCart();
  const params = useLocalSearchParams<{ selectedId?: string }>();
  const [selectedId, setSelectedId] = useState(
    params.selectedId ?? selectedAddress.id
  );

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const handleDeliver = () => {
    const selected = savedAddresses.find((a) => a.id === selectedId);
    if (selected) {
      selectAddressById(selected.id);
      router.replace('/(tabs)/cart');
    }
  };

  const handleAddNew = () => {
    router.push('/add-address');
  };

  const getLabelIcon = (label: AddressLabel): React.ComponentProps<typeof MaterialCommunityIcons>['name'] => {
    switch (label) {
      case 'Home':
        return 'home';
      case 'Work':
        return 'briefcase';
      case 'Other':
        return 'map-marker';
      default:
        return 'map-marker';
    }
  };

  const getLabelIconBg = (label: AddressLabel): string => {
    switch (label) {
      case 'Home':
        return '#F7E8E6';
      case 'Work':
        return '#E8EDF7';
      default:
        return '#F0F0F0';
    }
  };

  const getLabelIconColor = (label: AddressLabel): string => {
    switch (label) {
      case 'Home':
        return '#AC1D10';
      case 'Work':
        return '#4A5568';
      default:
        return '#666';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.back()}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="#1A1A1A" />
          </Pressable>
          <Text style={styles.headerTitle}>Delivery Address</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Map Preview */}
          <View style={styles.mapContainer}>
            <View style={styles.mapPlaceholder}>
              <Image
                source={{
                  uri: 'https://api.mapbox.com/styles/v1/mapbox/light-v11/static/121.0437,14.6349,15,0/400x180@2x?access_token=pk.placeholder',
                }}
                style={styles.mapImage}
                defaultSource={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' }}
              />
              <View style={styles.mapOverlay} />
              {/* Pin */}
              <View style={styles.pinContainer}>
                <View style={styles.pinDot} />
                <View style={styles.pinShadow} />
              </View>
            </View>

            {/* Use Current Location */}
            <Pressable
              style={({ pressed }) => [styles.currentLocationRow, pressed && styles.pressed]}>
              <View style={styles.currentLocationLeft}>
                <View style={styles.currentLocationDot}>
                  <View style={styles.currentLocationDotInner} />
                </View>
                <Text style={styles.currentLocationText}>Use current location</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#888" />
            </Pressable>
          </View>

          {/* Saved Addresses Header */}
          <View style={styles.savedHeader}>
            <Text style={styles.savedTitle}>Saved Addresses</Text>
            <Pressable style={({ pressed }) => [pressed && styles.pressed]}>
              <Text style={styles.editAllText}>Edit All</Text>
            </Pressable>
          </View>

          {/* Address List */}
          {savedAddresses.map((addr) => {
            const isSelected = selectedId === addr.id;
            return (
              <Pressable
                key={addr.id}
                style={[styles.addressCard, isSelected && styles.addressCardSelected]}
                onPress={() => handleSelect(addr.id)}>
                <View style={[styles.addressIconWrap, { backgroundColor: getLabelIconBg(addr.label) }]}>
                  <MaterialCommunityIcons
                    name={getLabelIcon(addr.label)}
                    size={20}
                    color={getLabelIconColor(addr.label)}
                  />
                </View>

                <View style={styles.addressInfo}>
                  <View style={styles.addressLabelRow}>
                    <Text style={styles.addressLabel}>{addr.label}</Text>
                    {addr.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addressText} numberOfLines={2}>
                    {addr.fullAddress}
                  </Text>
                </View>

                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </Pressable>
            );
          })}

          {/* Add New Address */}
          <Pressable
            style={({ pressed }) => [styles.addNewCard, pressed && styles.pressed]}
            onPress={handleAddNew}>
            <MaterialCommunityIcons name="plus" size={20} color="#666" />
            <Text style={styles.addNewText}>Add New Address</Text>
          </Pressable>
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomBar}>
          <Pressable
            style={({ pressed }) => [styles.deliverButton, pressed && styles.deliverPressed]}
            onPress={handleDeliver}>
            <Text style={styles.deliverButtonText}>Deliver to this Address</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSpacer: {
    width: 36,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  mapContainer: {
    borderRadius: 14,
    backgroundColor: '#EFEFEF',
    overflow: 'hidden',
    marginBottom: 20,
  },
  mapPlaceholder: {
    height: 150,
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
  currentLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  currentLocationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  currentLocationDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(172, 29, 16, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#AC1D10',
  },
  currentLocationText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  savedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  savedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  editAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#AC1D10',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#EBEBEB',
    gap: 12,
  },
  addressCardSelected: {
    borderColor: '#AC1D10',
    backgroundColor: '#FFF9F8',
  },
  addressIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressInfo: {
    flex: 1,
  },
  addressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  defaultBadge: {
    backgroundColor: '#AC1D10',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  defaultBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 13,
    color: '#777',
    lineHeight: 18,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#AC1D10',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#AC1D10',
  },
  addNewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: '#EBEBEB',
    borderStyle: 'dashed',
    gap: 8,
    marginBottom: 10,
  },
  addNewText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 10,
    backgroundColor: '#F8F8F8',
  },
  deliverButton: {
    backgroundColor: '#AC1D10',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliverPressed: {
    opacity: 0.88,
  },
  deliverButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.7,
  },
});
