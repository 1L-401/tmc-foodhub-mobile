import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AddressLabel } from '@/components/cart/types';

const LABEL_OPTIONS: { label: AddressLabel; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; color: string }[] = [
  { label: 'Home', icon: 'home', color: '#AC1D10' },
  { label: 'Work', icon: 'briefcase', color: '#4A5568' },
  { label: 'Other', icon: 'heart', color: '#D97706' },
];

export default function AddAddressScreen() {
  const [streetAddress, setStreetAddress] = useState(
    '123 Quezon Avenue, Unit 4B, Brgy. South Triangle, Quezon City, Metro Manila'
  );
  const [unitFloor, setUnitFloor] = useState('');
  const [city, setCity] = useState('Quezon City');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<AddressLabel>('Home');

  const handleSave = () => {
    // In a real app, save to backend/store
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              onPress={() => router.back()}>
              <MaterialCommunityIcons name="chevron-left" size={28} color="#1A1A1A" />
            </Pressable>
            <Text style={styles.headerTitle}>Add Address</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            {/* Map Preview */}
            <View style={styles.mapContainer}>
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

              {/* Map Controls */}
              <View style={styles.mapControls}>
                <Pressable style={styles.mapControlButton}>
                  <MaterialCommunityIcons name="crosshairs-gps" size={18} color="#555" />
                </Pressable>
                <Pressable style={styles.mapControlButton}>
                  <MaterialCommunityIcons name="fullscreen" size={18} color="#555" />
                </Pressable>
              </View>
            </View>

            {/* Delivery Details */}
            <Text style={styles.sectionTitle}>Delivery Details</Text>

            {/* Street Address */}
            <Text style={styles.fieldLabel}>Street Address</Text>
            <View style={styles.textAreaWrap}>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={3}
                value={streetAddress}
                onChangeText={setStreetAddress}
                placeholder="Enter your full street address"
                placeholderTextColor="#A0A0A0"
              />
            </View>

            {/* Unit/Floor & City */}
            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Unit/Floor</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    value={unitFloor}
                    onChangeText={setUnitFloor}
                    placeholder="e.g. 4B"
                    placeholderTextColor="#A0A0A0"
                  />
                </View>
              </View>

              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>City</Text>
                <Pressable style={styles.dropdownWrap}>
                  <Text style={styles.dropdownText}>{city || 'Select city'}</Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color="#888" />
                </Pressable>
              </View>
            </View>

            {/* Delivery Notes */}
            <Text style={styles.fieldLabel}>Delivery Notes</Text>
            <View style={styles.notesWrap}>
              <TextInput
                style={styles.notesInput}
                multiline
                numberOfLines={4}
                value={deliveryNotes}
                onChangeText={setDeliveryNotes}
                placeholder="Gate code, drop-off instructions..."
                placeholderTextColor="#A0A0A0"
                textAlignVertical="top"
              />
            </View>

            {/* Save As */}
            <Text style={styles.fieldLabel}>Save As</Text>
            <View style={styles.labelRow}>
              {LABEL_OPTIONS.map((opt) => {
                const isActive = selectedLabel === opt.label;
                return (
                  <Pressable
                    key={opt.label}
                    style={[styles.labelOption, isActive && styles.labelOptionActive]}
                    onPress={() => setSelectedLabel(opt.label)}>
                    <MaterialCommunityIcons
                      name={opt.icon}
                      size={16}
                      color={isActive ? '#AC1D10' : '#888'}
                    />
                    <Text
                      style={[
                        styles.labelOptionText,
                        isActive && styles.labelOptionTextActive,
                      ]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Bottom Save Button */}
          <View style={styles.bottomBar}>
            <Pressable
              style={({ pressed }) => [styles.saveButton, pressed && styles.savePressed]}
              onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Address</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  flex: {
    flex: 1,
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
    height: 160,
    backgroundColor: '#E8E4DF',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 20,
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
  mapControls: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    gap: 6,
  },
  mapControlButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
    marginTop: 4,
  },
  textAreaWrap: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  textArea: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 22,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  rowFields: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfField: {
    flex: 1,
  },
  inputWrap: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    height: 46,
    justifyContent: 'center',
  },
  input: {
    fontSize: 15,
    color: '#1A1A1A',
  },
  dropdownWrap: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 15,
    color: '#1A1A1A',
  },
  notesWrap: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    minHeight: 100,
  },
  notesInput: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 22,
    minHeight: 80,
  },
  labelRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  labelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E3E3E3',
    backgroundColor: '#FFFFFF',
  },
  labelOptionActive: {
    borderColor: '#AC1D10',
    backgroundColor: '#FFF5F4',
  },
  labelOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  labelOptionTextActive: {
    color: '#AC1D10',
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
  saveButton: {
    backgroundColor: '#AC1D10',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savePressed: {
    opacity: 0.88,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.7,
  },
});
