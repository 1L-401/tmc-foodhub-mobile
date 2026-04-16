import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PolicyCard } from '@/components/settings/policy-card';
import { PolicyItem } from '@/components/settings/policy-item';
import { SectionHeader } from '@/components/settings/section-header';

const TERMS_OF_SERVICE_ITEMS = [
  {
    title: 'Acceptance of Terms',
    description:
      'By accessing and using TMC Foodhub, you agree to follow these terms, policy updates, and all applicable local regulations.',
  },
  {
    title: 'User Conduct',
    description:
      'Users must provide accurate information, respect other users, and avoid any abusive, fraudulent, or disruptive behavior within the platform.',
  },
] as const;

const PRIVACY_POLICY_ITEMS = [
  {
    title: 'Data Collection',
    description:
      'We collect account details, order activity, and device signals required to deliver features, improve app reliability, and support account protection.',
  },
  {
    title: 'Third-Party Sharing',
    description:
      'Necessary data is shared only with payment processors, delivery partners, and service providers who help us run core app operations securely.',
  },
] as const;

const COMMUNITY_GUIDELINES = [
  'Constructive Feedback',
  'Authenticity',
  'No Self-Promotion',
] as const;

export default function TermsPoliciesScreen() {
  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const handleContactLegalTeam = useCallback(() => {
    router.push('/help-support');
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              onPress={handleBack}>
              <MaterialCommunityIcons name="chevron-left" size={26} color="#1A1A1A" />
            </Pressable>

            <Text style={styles.headerTitle}>Terms & Policies</Text>

            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            <PolicyCard style={styles.cardSpacing}>
              <SectionHeader
                icon="file-document-outline"
                title="Terms of Service"
                subtitle="Last updated: April 16, 2026"
              />

              <Text style={styles.introText}>
                These terms explain the responsibilities and expectations when using TMC Foodhub.
              </Text>

              {TERMS_OF_SERVICE_ITEMS.map((item) => (
                <PolicyItem
                  key={item.title}
                  title={item.title}
                  description={item.description}
                />
              ))}
            </PolicyCard>

            <PolicyCard style={styles.cardSpacing}>
              <SectionHeader icon="shield-account-outline" title="Privacy Policy" />

              <Text style={styles.introText}>
                We are committed to responsible data handling practices and transparent privacy standards.
              </Text>

              {PRIVACY_POLICY_ITEMS.map((item) => (
                <PolicyItem
                  key={item.title}
                  title={item.title}
                  description={item.description}
                  variant="sub-card"
                />
              ))}
            </PolicyCard>

            <PolicyCard style={styles.cardSpacing}>
              <SectionHeader icon="account-group-outline" title="Community Guidelines" />

              <Text style={styles.introText}>
                To maintain a trusted ecosystem, please follow these standards:
              </Text>

              {COMMUNITY_GUIDELINES.map((guideline) => (
                <PolicyItem key={guideline} title={guideline} variant="bullet" />
              ))}
            </PolicyCard>

            <View style={styles.footerWrap}>
              <Text style={styles.footerText}>Have questions about our policies?</Text>

              <Pressable
                style={({ pressed }) => [styles.ctaButton, pressed && styles.pressed]}
                onPress={handleContactLegalTeam}>
                <MaterialCommunityIcons name="scale-balance" size={17} color="#FFFFFF" />
                <Text style={styles.ctaButtonText}>Contact Legal Team</Text>
              </Pressable>
            </View>
          </ScrollView>
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
    marginBottom: 16,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    marginLeft: 8,
    fontSize: 19,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSpacer: {
    width: 32,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  cardSpacing: {
    marginBottom: 14,
  },
  introText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#666666',
  },
  footerWrap: {
    marginTop: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECECEC',
    backgroundColor: '#FFFFFF',
    padding: 14,
  },
  footerText: {
    fontSize: 12,
    color: '#777777',
    marginBottom: 10,
  },
  ctaButton: {
    height: 44,
    borderRadius: 10,
    backgroundColor: '#952011',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.75,
  },
});