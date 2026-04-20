import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { SectionCard } from '@/components/settings/section-card';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type NotificationPreferenceId = 'orderUpdates' | 'promotions' | 'reminders';

type NotificationPreference = {
  id: NotificationPreferenceId;
  title: string;
  description: string;
  icon: IconName;
};

const NOTIFICATION_PREFERENCES: NotificationPreference[] = [
  {
    id: 'orderUpdates',
    title: 'Order Updates',
    description: 'Real-time status of your food from the kitchen to your doorstep.',
    icon: 'silverware-fork-knife',
  },
  {
    id: 'promotions',
    title: 'Promotions',
    description: 'Exclusive discounts, local happy hours, and seasonal curated deals.',
    icon: 'tag-outline',
  },
  {
    id: 'reminders',
    title: 'Reminders',
    description: 'Abandoned cart alerts and dinner-time nudges for your favorites.',
    icon: 'bell-ring-outline',
  },
];

type ToggleState = Record<NotificationPreferenceId, boolean>;

const INITIAL_TOGGLE_STATE: ToggleState = {
  orderUpdates: true,
  promotions: true,
  reminders: true,
};

const SWITCH_OFF_TRACK_COLOR = '#CECECE';
const SWITCH_ON_TRACK_COLOR = Colors.light.tint;
const SWITCH_THUMB_COLOR = Colors.light.background;

type NotificationToggleProps = {
  value: boolean;
  onValueChange: (nextValue: boolean) => void;
};

function NotificationToggle({ value, onValueChange }: NotificationToggleProps) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      style={[
        styles.switchTrack,
        { backgroundColor: value ? SWITCH_ON_TRACK_COLOR : SWITCH_OFF_TRACK_COLOR },
      ]}>
      <View
        style={[
          styles.switchThumb,
          value ? styles.switchThumbOn : styles.switchThumbOff,
          { backgroundColor: SWITCH_THUMB_COLOR },
        ]}
      />
    </Pressable>
  );
}

export default function NotificationSettingsScreen() {
  const [toggles, setToggles] = useState<ToggleState>(INITIAL_TOGGLE_STATE);

  const handleBackPress = useCallback(() => {
    router.back();
  }, []);

  const handleToggleChange = useCallback((id: NotificationPreferenceId, nextValue: boolean) => {
    setToggles((previous) => ({
      ...previous,
      [id]: nextValue,
    }));
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <Pressable
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              onPress={handleBackPress}>
              <MaterialCommunityIcons name="chevron-left" size={26} color="#1A1A1A" />
            </Pressable>

            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>
              Customize how we keep you updated on your culinary adventures.
            </Text>

            {NOTIFICATION_PREFERENCES.map((preference) => (
              <SectionCard
                key={preference.id}
                style={styles.preferenceCard}
                backgroundColor="#EFEFEF"
                borderColor="#E2E2E2">
                <View style={styles.preferenceTopRow}>
                  <View style={styles.preferenceTitleRow}>
                    <View style={styles.iconWrap}>
                      <MaterialCommunityIcons name={preference.icon} size={20} color="#4A4A4A" />
                    </View>
                    <Text style={styles.preferenceTitle}>{preference.title}</Text>
                  </View>

                  <NotificationToggle
                    value={toggles[preference.id]}
                    onValueChange={(nextValue) => handleToggleChange(preference.id, nextValue)}
                  />
                </View>

                <Text style={styles.preferenceDescription}>{preference.description}</Text>
              </SectionCard>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  container: {
    paddingHorizontal: 16,
  },
  pressed: {
    opacity: 0.78,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  title: {
    marginTop: 10,
    fontSize: 34,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
    color: '#6F6F6F',
  },
  preferenceCard: {
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
  },
  preferenceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  preferenceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
    paddingRight: 8,
  },
  iconWrap: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2B2B2B',
  },
  preferenceDescription: {
    marginTop: 8,
    marginLeft: 36,
    fontSize: 13,
    lineHeight: 18,
    color: '#666666',
  },
  switchTrack: {
    width: 42,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    top: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 1,
  },
  switchThumbOn: {
    right: 2,
  },
  switchThumbOff: {
    left: 2,
  },
});