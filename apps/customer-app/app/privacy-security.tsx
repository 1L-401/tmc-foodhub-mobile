import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SectionCard } from '@/components/settings/section-card';
import { SettingsRow } from '@/components/settings/settings-row';

export default function PrivacySecurityScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              onPress={() => router.back()}>
              <MaterialCommunityIcons name="chevron-left" size={26} color="#1A1A1A" />
            </Pressable>
            <Text style={styles.headerTitle}>Privacy & Security</Text>
            <View style={styles.headerSpacer} />
          </View>

          <Text style={styles.subtitle}>Manage your account security settings.</Text>
          <Text style={styles.sectionOverline}>SECURITY</Text>

          <SectionCard style={styles.sectionCard}>
            <SettingsRow
              icon="lock-reset"
              label="Change Password"
              value="Update"
              onPress={() => router.push('/change-password')}
            />
          </SectionCard>

          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="shield-check-outline" size={20} color="#AC1D10" />
            <Text style={styles.infoText}>
              Changing your password will sign you out on all devices for account safety.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  subtitle: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 14,
  },
  sectionOverline: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888888',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  sectionCard: {
    marginBottom: 14,
  },
  infoCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE1DF',
    backgroundColor: '#FFF6F5',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#6E3A36',
    lineHeight: 18,
    fontWeight: '500',
  },
});