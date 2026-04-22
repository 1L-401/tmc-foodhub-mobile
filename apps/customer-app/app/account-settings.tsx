import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SectionCard } from '@/components/settings/section-card';
import { SettingsRow } from '@/components/settings/settings-row';
import { useAuth } from '@/contexts/auth-context';

const AVATAR_PLACEHOLDER = require('../assets/images/icon.png');

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type AccountField = {
  id: string;
  icon: IconName;
  label: string;
  value: string;
  statusLabel?: string;
  onPress: () => void;
};

type AccountAction = {
  id: string;
  icon: IconName;
  label: string;
  description: string;
  destructive?: boolean;
  onPress: () => void;
};

export default function AccountSettingsScreen() {
  const { user } = useAuth();

  const themedColors = useMemo(() => {
    return {
      screenBackground: '#FFFFFF',
      cardBackground: '#EFEFEF',
      cardBorder: '#E1E1E1',
      rowDivider: '#D9D9D9',
      primaryText: '#1A1A1A',
      secondaryText: '#7E7E7E',
      valueText: '#606060',
      icon: '#4A4A4A',
      chevron: '#5C5C5C',
      verifyText: '#D6872B',
      warningText: '#7E7E7E',
      destructive: '#E21B0E',
      buttonBackground: '#F7F7F7',
      buttonBorder: '#D0D0D0',
      buttonText: '#2B2B2B',
      avatarBackground: '#D5D5D5',
    };
  }, []);

  const displayName = user?.name?.trim() ? user.name : 'John Doe';
  const displayEmail = user?.email?.trim() ? user.email : 'johndoe@email.com';

  const handleBackPress = useCallback(() => {
    router.back();
  }, []);

  const handleChangeImagePress = useCallback(() => {
    console.log('[AccountSettings] Change image pressed');
  }, []);

  const handleNamePress = useCallback(() => {
    console.log('[AccountSettings] Name row pressed');
  }, []);

  const handleUsernamePress = useCallback(() => {
    console.log('[AccountSettings] Username row pressed');
  }, []);

  const handleEmailPress = useCallback(() => {
    console.log('[AccountSettings] Email row pressed');
  }, []);

  const handlePhonePress = useCallback(() => {
    console.log('[AccountSettings] Phone row pressed');
  }, []);

  const handlePasswordPress = useCallback(() => {
    router.push('/change-password');
  }, []);

  const handleDeactivatePress = useCallback(() => {
    console.log('[AccountSettings] Deactivate account pressed');
  }, []);

  const handleDeletePress = useCallback(() => {
    console.log('[AccountSettings] Delete account pressed');
  }, []);

  const accountFields = useMemo<AccountField[]>(
    () => [
      {
        id: 'name',
        icon: 'account-circle-outline',
        label: 'Name',
        value: displayName,
        onPress: handleNamePress,
      },
      {
        id: 'username',
        icon: 'at',
        label: 'Username',
        value: '@johndoe',
        onPress: handleUsernamePress,
      },
      {
        id: 'email',
        icon: 'email-outline',
        label: 'Email',
        value: displayEmail,
        statusLabel: 'Verify',
        onPress: handleEmailPress,
      },
      {
        id: 'phone',
        icon: 'phone-outline',
        label: 'Phone Number',
        value: '+63 912 345 6789',
        onPress: handlePhonePress,
      },
      {
        id: 'password',
        icon: 'lock-outline',
        label: 'Password',
        value: '••••••••',
        onPress: handlePasswordPress,
      },
    ],
    [
      displayEmail,
      displayName,
      handleEmailPress,
      handleNamePress,
      handlePasswordPress,
      handlePhonePress,
      handleUsernamePress,
    ],
  );

  const accountActions = useMemo<AccountAction[]>(
    () => [
      {
        id: 'deactivate',
        icon: 'pause-circle-outline',
        label: 'Deactivate Account',
        description:
          'Temporarily disable your account. You can reactivate anytime by signing back in.',
        onPress: handleDeactivatePress,
      },
      {
        id: 'delete',
        icon: 'delete-outline',
        label: 'Delete Account',
        description:
          'Permanently remove your account and all associated data. This action cannot be undone.',
        destructive: true,
        onPress: handleDeletePress,
      },
    ],
    [handleDeactivatePress, handleDeletePress],
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: themedColors.screenBackground }]} edges={['top', 'bottom']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <Pressable
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              onPress={handleBackPress}>
              <MaterialCommunityIcons name="chevron-left" size={26} color={themedColors.primaryText} />
            </Pressable>

            <Text style={[styles.title, { color: themedColors.primaryText }]}>Account</Text>
            <Text style={[styles.subtitle, { color: themedColors.secondaryText }]}>
              Manage your personal details and contact information.
            </Text>

            <SectionCard
              style={styles.profileCard}
              backgroundColor={themedColors.cardBackground}
              borderColor={themedColors.cardBorder}>
              <View style={styles.profileTopRow}>
                <Image
                  source={AVATAR_PLACEHOLDER}
                  style={[styles.avatarImage, { backgroundColor: themedColors.avatarBackground }]}
                  resizeMode="cover"
                />

                <Pressable
                  style={({ pressed }) => [
                    styles.changeImageButton,
                    {
                      backgroundColor: themedColors.buttonBackground,
                      borderColor: themedColors.buttonBorder,
                    },
                    pressed && styles.pressed,
                  ]}
                  onPress={handleChangeImagePress}>
                  <Text style={[styles.changeImageText, { color: themedColors.buttonText }]}>Change Image</Text>
                </Pressable>
              </View>

              <Text style={[styles.profileHelperText, { color: themedColors.secondaryText }]}>
                Upload a picture to personalize your profile.
              </Text>
            </SectionCard>

            <SectionCard
              style={styles.sectionCard}
              backgroundColor={themedColors.cardBackground}
              borderColor={themedColors.cardBorder}>
              {accountFields.map((field, index) => (
                <SettingsRow
                  key={field.id}
                  icon={field.icon}
                  label={field.label}
                  value={field.value}
                  statusLabel={field.statusLabel}
                  onPress={field.onPress}
                  showDivider={index < accountFields.length - 1}
                  backgroundColor={themedColors.cardBackground}
                  dividerColor={themedColors.rowDivider}
                  iconColor={themedColors.icon}
                  labelColor={themedColors.primaryText}
                  valueColor={themedColors.valueText}
                  indicatorColor={themedColors.chevron}
                  statusLabelColor={themedColors.verifyText}
                />
              ))}
            </SectionCard>

            <SectionCard
              style={styles.sectionCard}
              backgroundColor={themedColors.cardBackground}
              borderColor={themedColors.cardBorder}>
              {accountActions.map((action, index) => (
                <View
                  key={action.id}
                  style={[
                    styles.actionBlock,
                    index < accountActions.length - 1 && [
                      styles.actionBlockDivider,
                      { borderBottomColor: themedColors.rowDivider },
                    ],
                  ]}>
                  <SettingsRow
                    icon={action.icon}
                    label={action.label}
                    onPress={action.onPress}
                    destructive={action.destructive}
                    backgroundColor={themedColors.cardBackground}
                    iconColor={action.destructive ? themedColors.destructive : themedColors.icon}
                    labelColor={action.destructive ? themedColors.destructive : themedColors.primaryText}
                    indicatorColor={action.destructive ? themedColors.destructive : themedColors.chevron}
                  />

                  <Text style={[styles.actionDescription, { color: themedColors.warningText }]}>
                    {action.description}
                  </Text>
                </View>
              ))}
            </SectionCard>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  profileCard: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    marginBottom: 14,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  changeImageButton: {
    minHeight: 34,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeImageText: {
    fontSize: 14,
    fontWeight: '700',
  },
  profileHelperText: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 17,
  },
  sectionCard: {
    marginBottom: 14,
  },
  actionBlock: {
    paddingBottom: 12,
  },
  actionBlockDivider: {
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  actionDescription: {
    marginTop: 2,
    paddingHorizontal: 14,
    paddingRight: 20,
    fontSize: 12,
    lineHeight: 17,
  },
});