import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SettingsRow } from '@/components/settings/settings-row';
import { SettingsSection } from '@/components/settings/settings-section';
import { useAuth } from '@/contexts/auth-context';

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return 'JD';
  }

  const first = parts[0]?.[0] ?? '';
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';

  if (!second) {
    return `${first}${first}`.toUpperCase();
  }

  return `${first}${second}`.toUpperCase();
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(false);

  const displayName = user?.name?.trim() ? user.name : 'John Doe';
  const displayEmail = user?.email?.trim() ? user.email : 'john.doe@gmail.com';

  const initials = useMemo(() => getInitials(displayName), [displayName]);

  const handleMenuPress = useCallback(() => {
    router.push('/(tabs)');
  }, []);

  const handleOpenAccount = useCallback(() => {
    router.push('/account-settings');
  }, []);

  const handleOpenPrivacy = useCallback(() => {
    router.push('/privacy-security');
  }, []);

  const handleOpenAddresses = useCallback(() => {
    router.push('/delivery-address');
  }, []);

  const handleOpenPaymentMethods = useCallback(() => {
    router.push('/add-payment-method');
  }, []);

  const handleOpenNotifications = useCallback(() => {
    router.push('/notification-settings');
  }, []);

  const handleOpenTerms = useCallback(() => {
    router.push('/terms-policies');
  }, []);

  const handleOpenHelp = useCallback(() => {
    router.push('/help-support');
  }, []);

  const handleToggleDarkMode = useCallback((nextValue: boolean) => {
    setIsDarkModeEnabled(nextValue);
  }, []);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    try {
      await signOut();
      setIsLoggingOut(false);
      router.replace('/(auth)/login');
    } catch {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, signOut]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <Pressable
            style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}
            onPress={handleMenuPress}>
            <MaterialCommunityIcons name="menu" size={24} color="#1A1A1A" />
          </Pressable>
        </View>

        <Text style={styles.title}>Settings</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileBlock}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.profileTextWrap}>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileEmail}>{displayEmail}</Text>
            </View>
          </View>

          <SettingsSection title="Account">
            <SettingsRow
              icon="account-circle-outline"
              label="Account"
              onPress={handleOpenAccount}
              showDivider
            />
            <SettingsRow
              icon="shield-lock-outline"
              label="Privacy & Security"
              onPress={handleOpenPrivacy}
              showDivider
            />
            <SettingsRow
              icon="home-outline"
              label="Addresses"
              onPress={handleOpenAddresses}
              showDivider
            />
            <SettingsRow
              icon="credit-card-outline"
              label="Payment Methods"
              onPress={handleOpenPaymentMethods}
            />
          </SettingsSection>

          <SettingsSection title="Preferences">
            <SettingsRow
              icon="weather-night"
              label="Dark Mode"
              trailing={
                <Switch
                  value={isDarkModeEnabled}
                  onValueChange={handleToggleDarkMode}
                  trackColor={{ false: '#CECECE', true: '#D9A8A2' }}
                  thumbColor={isDarkModeEnabled ? '#952011' : '#FFFFFF'}
                  ios_backgroundColor="#CECECE"
                />
              }
              indicator="none"
              showDivider
            />
            <SettingsRow
              icon="bell-outline"
              label="Notifications"
              onPress={handleOpenNotifications}
            />
          </SettingsSection>

          <SettingsSection title="Privacy & Support">
            <SettingsRow
              icon="file-document-outline"
              label="Terms & Policies"
              onPress={handleOpenTerms}
              indicator="external"
              showDivider
            />
            <SettingsRow
              icon="headset"
              label="Help & Support"
              onPress={handleOpenHelp}
            />
          </SettingsSection>

          <Pressable
            style={({ pressed }) => [
              styles.signOutButton,
              pressed && styles.pressed,
              isLoggingOut && styles.signOutButtonDisabled,
            ]}
            onPress={handleLogout}
            disabled={isLoggingOut}>
            <Text style={styles.signOutText}>
              {isLoggingOut ? 'Signing out...' : 'Sign out'}
            </Text>
          </Pressable>
        </ScrollView>
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
    paddingHorizontal: 20,
  },
  pressed: {
    opacity: 0.75,
  },
  topRow: {
    marginTop: 8,
    marginBottom: 8,
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 38,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  profileBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#3D3D3D',
    fontSize: 20,
    fontWeight: '800',
  },
  profileTextWrap: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2B2B2B',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 15,
    color: '#777777',
  },
  signOutButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5BCB7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
    marginTop: 6,
  },
  signOutButtonDisabled: {
    opacity: 0.75,
  },
  signOutText: {
    color: '#E21B0E',
    fontSize: 16,
    fontWeight: '700',
  },
});
