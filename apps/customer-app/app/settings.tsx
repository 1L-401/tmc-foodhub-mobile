import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SectionCard } from '@/components/settings/section-card';
import { SettingsRow } from '@/components/settings/settings-row';
import { useAuth } from '@/contexts/auth-context';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const displayName = user?.name?.trim() ? user.name : 'Unknown User';
  const displayEmail = user?.email?.trim() ? user.email : 'No email provided';
  const avatarUrl = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=F7E8E6&color=AC1D10&size=150`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={26} color="#1A1A1A" />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Card Summary */}
        <View style={styles.profileSummaryContainer}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{displayEmail}</Text>
          </View>
        </View>

        {/* Account Section */}
        <SectionCard title="ACCOUNT" style={styles.sectionMargin}>
          <SettingsRow
            icon="account-circle-outline"
            label="Account"
            onPress={() => router.push('/account-settings')}
            showDivider
          />
          <SettingsRow
            icon="shield-lock-outline"
            label="Privacy & Security"
            onPress={() => router.push('/privacy-security')}
            showDivider
          />
          <SettingsRow
            icon="map-marker-outline"
            label="Addresses"
            onPress={() => router.push('/delivery-address')}
            showDivider
          />
          <SettingsRow
            icon="credit-card-outline"
            label="Payment Methods"
            onPress={() => router.push('/add-payment-method')}
          />
        </SectionCard>

        {/* Preferences Section */}
        <SectionCard title="PREFERENCES" style={styles.sectionMargin}>
          <SettingsRow
            icon="moon-waxing-crescent"
            label="Dark Mode"
            indicator="none"
            showDivider
            trailing={
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                trackColor={{ false: '#EAEAEA', true: '#AC1D10' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#EAEAEA"
              />
            }
          />
          <SettingsRow
            icon="bell-outline"
            label="Notifications"
            onPress={() => router.push('/notification-settings')}
          />
        </SectionCard>

        {/* Privacy & Support */}
        <SectionCard title="PRIVACY & SUPPORT" style={styles.sectionMargin}>
          <SettingsRow
            icon="file-document-outline"
            label="Terms & Policies"
            indicator="external"
            onPress={() => router.push('/terms-policies')}
            showDivider
          />
          <SettingsRow
            icon="help-circle-outline"
            label="Help & Support"
            indicator="external"
            onPress={() => router.push('/help-support')}
          />
        </SectionCard>

        {/* Sign Out Button */}
        <Pressable 
            style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}
            onPress={signOut}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#F8F8F8',
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  
  /* Profile Summary Card */
  profileSummaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EFEFEF',
    marginRight: 14,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    color: '#666666',
  },

  /* Sections */
  sectionMargin: {
    marginBottom: 24,
  },

  /* Sign Out Button */
  signOutButton: {
    minHeight: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E21B0E',
  },

  bottomSpacer: {
    height: 40,
  },
});
