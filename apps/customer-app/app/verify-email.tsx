import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SectionCard } from '@/components/settings/section-card';
import { useAuth } from '@/contexts/auth-context';

export default function VerifyEmailScreen() {
  const { user } = useAuth();

  const displayEmail = user?.email?.trim() ? user.email : 'No email provided';
  const isEmailVerified = user?.email_verified === true || Boolean(user?.email_verified_at);

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
            <Text style={styles.headerTitle}>Email Verification</Text>
            <View style={styles.headerSpacer} />
          </View>

          <Text style={styles.subtitle}>
            Manage your email verification state. Verification actions will be available in a future update.
          </Text>

          <SectionCard style={styles.sectionCard}>
            <View style={styles.emailRow}>
              <View style={styles.emailIconWrap}>
                <MaterialCommunityIcons name="email-outline" size={20} color="#4A4A4A" />
              </View>
              <View style={styles.emailDetails}>
                <Text style={styles.emailLabel}>Email Address</Text>
                <Text style={styles.emailValue}>{displayEmail}</Text>
              </View>
            </View>

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status</Text>
              <Text style={[styles.statusValue, isEmailVerified ? styles.statusVerified : styles.statusUnverified]}>
                {isEmailVerified ? 'Verified' : 'Not Verified'}
              </Text>
            </View>
          </SectionCard>

          <SectionCard style={styles.noticeCard}>
            <View style={styles.noticeRow}>
              <MaterialCommunityIcons name="information-outline" size={20} color="#AC1D10" />
              <Text style={styles.noticeText}>
                Verification logic is not enabled yet. Please check again in a future release.
              </Text>
            </View>
          </SectionCard>
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
    opacity: 0.76,
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
  sectionCard: {
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  emailIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailDetails: {
    flex: 1,
  },
  emailLabel: {
    fontSize: 12,
    color: '#6B6B6B',
    marginBottom: 2,
  },
  emailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  statusRow: {
    borderTopWidth: 1,
    borderTopColor: '#DDDDDD',
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: 13,
    color: '#666666',
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusVerified: {
    color: '#1E7A38',
  },
  statusUnverified: {
    color: '#D6872B',
  },
  noticeCard: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  noticeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: '#6E3A36',
    lineHeight: 18,
    fontWeight: '500',
  },
});
