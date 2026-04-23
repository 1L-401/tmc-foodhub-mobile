import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
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

import { SectionCard } from '@/components/settings/section-card';
import { SettingsRow } from '@/components/settings/settings-row';
import { useAuth } from '@/contexts/auth-context';
import {
  type AccountSettingsFormField,
  useAccountSettingsForm,
} from '@/src/features/account/hooks/useAccountSettingsForm';

const AVATAR_PLACEHOLDER = require('../assets/images/icon.png');

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type AccountAction = {
  id: string;
  icon: IconName;
  label: string;
  description: string;
  destructive?: boolean;
  onPress: () => void;
};

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  error?: string;
  editable: boolean;
  multiline?: boolean;
  maxLength?: number;
  keyboardType?: React.ComponentProps<typeof TextInput>['keyboardType'];
  autoCapitalize?: React.ComponentProps<typeof TextInput>['autoCapitalize'];
};

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  editable,
  multiline = false,
  maxLength,
  keyboardType,
  autoCapitalize = 'words',
}: FormFieldProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrap, multiline && styles.inputWrapMultiline, error && styles.inputWrapError]}>
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#B0B0B0"
          editable={editable}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          maxLength={maxLength}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />
      </View>
      {error ? <Text style={styles.fieldErrorText}>{error}</Text> : null}
    </View>
  );
}

export default function AccountSettingsScreen() {
  const { user } = useAuth();
  const {
    values,
    fieldErrors,
    isSubmitting,
    errorMessage,
    successMessage,
    hasUnsavedChanges,
    setFieldValue,
    submit,
  } = useAccountSettingsForm();

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
      verifiedText: '#1E7A38',
      warningText: '#7E7E7E',
      destructive: '#E21B0E',
      buttonBackground: '#F7F7F7',
      buttonBorder: '#D0D0D0',
      buttonText: '#2B2B2B',
      avatarBackground: '#D5D5D5',
    };
  }, []);

  const displayEmail = user?.email?.trim() ? user.email : 'No email provided';
  const isEmailVerified = user?.email_verified === true || Boolean(user?.email_verified_at);

  const handleBackPress = useCallback(() => {
    if (!isSubmitting) {
      router.back();
    }
  }, [isSubmitting]);

  const handleSavePress = useCallback(() => {
    void submit();
  }, [submit]);

  const handleFieldValueChange = useCallback(
    (field: AccountSettingsFormField) => {
      return (value: string) => {
        setFieldValue(field, value);
      };
    },
    [setFieldValue],
  );

  const handleChangeImagePress = useCallback(() => {
    Alert.alert('Coming Soon', 'Profile photo updates are not available yet.');
  }, []);

  const handleEmailPress = useCallback(() => {
    router.push('/verify-email' as never);
  }, []);

  const handlePasswordPress = useCallback(() => {
    router.push('/change-password');
  }, []);

  const handleDeactivatePress = useCallback(() => {
    Alert.alert('Coming Soon', 'Deactivate account is not available yet.');
  }, []);

  const handleDeletePress = useCallback(() => {
    Alert.alert('Coming Soon', 'Delete account is not available yet.');
  }, []);

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

  const saveButtonLabel = isSubmitting
    ? 'Saving Changes...'
    : hasUnsavedChanges
      ? 'Save Changes'
      : 'No Changes to Save';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: themedColors.screenBackground }]} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}>
            <View style={styles.container}>
              <Pressable
                style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
                onPress={handleBackPress}
                disabled={isSubmitting}>
                <MaterialCommunityIcons name="chevron-left" size={26} color={themedColors.primaryText} />
              </Pressable>

              <Text style={[styles.title, { color: themedColors.primaryText }]}>Account</Text>
              <Text style={[styles.subtitle, { color: themedColors.secondaryText }]}>Manage your personal details and contact information.</Text>

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
                    onPress={handleChangeImagePress}
                    disabled={isSubmitting}>
                    <Text style={[styles.changeImageText, { color: themedColors.buttonText }]}>Change Image</Text>
                  </Pressable>
                </View>

                <Text style={[styles.profileHelperText, { color: themedColors.secondaryText }]}>Upload a picture to personalize your profile.</Text>
              </SectionCard>

              {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

              <SectionCard
                style={styles.formSectionCard}
                backgroundColor={themedColors.cardBackground}
                borderColor={themedColors.cardBorder}>
                <View style={styles.formHeaderRow}>
                  <MaterialCommunityIcons name="account-edit-outline" size={18} color={themedColors.icon} />
                  <Text style={[styles.formHeaderTitle, { color: themedColors.primaryText }]}>Profile Details</Text>
                </View>

                <FormField
                  label="First Name"
                  value={values.first_name}
                  onChangeText={handleFieldValueChange('first_name')}
                  placeholder="Enter first name"
                  error={fieldErrors.first_name}
                  editable={!isSubmitting}
                  maxLength={255}
                />

                <FormField
                  label="Last Name"
                  value={values.last_name}
                  onChangeText={handleFieldValueChange('last_name')}
                  placeholder="Enter last name"
                  error={fieldErrors.last_name}
                  editable={!isSubmitting}
                  maxLength={255}
                />

                <FormField
                  label="Phone Number"
                  value={values.phone}
                  onChangeText={handleFieldValueChange('phone')}
                  placeholder="Add your phone number"
                  error={fieldErrors.phone}
                  editable={!isSubmitting}
                  maxLength={25}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />

                <FormField
                  label="Address"
                  value={values.address}
                  onChangeText={handleFieldValueChange('address')}
                  placeholder="Add your delivery address"
                  error={fieldErrors.address}
                  editable={!isSubmitting}
                  multiline
                  maxLength={255}
                />

                <FormField
                  label="Delivery Instructions"
                  value={values.delivery_instructions}
                  onChangeText={handleFieldValueChange('delivery_instructions')}
                  placeholder="Add notes for your delivery rider"
                  error={fieldErrors.delivery_instructions}
                  editable={!isSubmitting}
                  multiline
                  maxLength={500}
                />

                <Pressable
                  style={({ pressed }) => [
                    styles.saveButton,
                    (isSubmitting || !hasUnsavedChanges) && styles.saveButtonDisabled,
                    pressed && !(isSubmitting || !hasUnsavedChanges) && styles.pressed,
                  ]}
                  onPress={handleSavePress}
                  disabled={isSubmitting || !hasUnsavedChanges}>
                  {isSubmitting ? <ActivityIndicator size="small" color="#FFFFFF" style={styles.saveSpinner} /> : null}
                  <Text style={styles.saveButtonText}>{saveButtonLabel}</Text>
                </Pressable>
              </SectionCard>

              <SectionCard
                style={styles.sectionCard}
                backgroundColor={themedColors.cardBackground}
                borderColor={themedColors.cardBorder}>
                <SettingsRow
                  icon="email-outline"
                  label="Email"
                  value={displayEmail}
                  statusLabel={isEmailVerified ? 'Verified' : 'Verify'}
                  onPress={handleEmailPress}
                  showDivider
                  backgroundColor={themedColors.cardBackground}
                  dividerColor={themedColors.rowDivider}
                  iconColor={themedColors.icon}
                  labelColor={themedColors.primaryText}
                  valueColor={themedColors.valueText}
                  indicatorColor={themedColors.chevron}
                  statusLabelColor={isEmailVerified ? themedColors.verifiedText : themedColors.verifyText}
                />

                <SettingsRow
                  icon="lock-outline"
                  label="Password"
                  value="********"
                  onPress={handlePasswordPress}
                  backgroundColor={themedColors.cardBackground}
                  iconColor={themedColors.icon}
                  labelColor={themedColors.primaryText}
                  valueColor={themedColors.valueText}
                  indicatorColor={themedColors.chevron}
                />
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

                    <Text style={[styles.actionDescription, { color: themedColors.warningText }]}>{action.description}</Text>
                  </View>
                ))}
              </SectionCard>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
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
  successText: {
    borderWidth: 1,
    borderColor: '#B9E4C5',
    backgroundColor: '#EDF9F1',
    color: '#1E7A38',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
  },
  errorText: {
    borderWidth: 1,
    borderColor: '#F1C7C2',
    backgroundColor: '#FFF5F4',
    color: '#B33E31',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionCard: {
    marginBottom: 14,
  },
  formSectionCard: {
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  formHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4D4D4D',
    marginBottom: 7,
  },
  inputWrap: {
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    minHeight: 46,
    paddingHorizontal: 12,
  },
  inputWrapMultiline: {
    minHeight: 96,
    paddingVertical: 10,
  },
  inputWrapError: {
    borderColor: '#D78A83',
    backgroundColor: '#FFF7F6',
  },
  input: {
    fontSize: 14,
    color: '#1A1A1A',
    minHeight: 44,
  },
  inputMultiline: {
    minHeight: 84,
    lineHeight: 20,
  },
  fieldErrorText: {
    marginTop: 6,
    fontSize: 11,
    color: '#C83B2D',
    fontWeight: '600',
    lineHeight: 16,
  },
  saveButton: {
    marginTop: 4,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: '#AC1D10',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  saveButtonDisabled: {
    opacity: 0.75,
  },
  saveSpinner: {
    marginRight: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
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
