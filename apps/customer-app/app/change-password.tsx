import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { ChangePasswordFieldErrors, useAuth } from '@/contexts/auth-context';

const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[A-Z])(?=.*\d).+$/;
const SUCCESS_REDIRECT_DELAY_MS = 900;

type PasswordFieldKey = keyof ChangePasswordFieldErrors;

export default function ChangePasswordScreen() {
  const { changePassword, signOut } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ChangePasswordFieldErrors>({});

  const clearFieldError = (field: PasswordFieldKey) => {
    setFieldErrors((previousValue) => {
      if (!previousValue[field]) {
        return previousValue;
      }

      const nextValue = { ...previousValue };
      delete nextValue[field];
      return nextValue;
    });
  };

  const clearFeedback = () => {
    if (errorMessage) {
      setErrorMessage(null);
    }

    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  const handleCurrentPasswordChange = (value: string) => {
    setCurrentPassword(value);
    clearFieldError('current_password');
    clearFeedback();
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    clearFieldError('password');
    clearFeedback();
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmNewPassword(value);
    clearFieldError('password_confirmation');
    clearFeedback();
  };

  const handleChangePassword = async () => {
    if (isSubmitting) {
      return;
    }

    if (!currentPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      setFieldErrors({});
      setSuccessMessage(null);
      setErrorMessage('All fields are required.');
      return;
    }

    if (newPassword.length < 8) {
      setFieldErrors({
        password: 'Password must be at least 8 characters long.',
      });
      setSuccessMessage(null);
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (!PASSWORD_COMPLEXITY_REGEX.test(newPassword)) {
      setFieldErrors({
        password: 'Password must contain at least one uppercase letter and one number.',
      });
      setSuccessMessage(null);
      setErrorMessage('Password must contain at least one uppercase letter and one number.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setFieldErrors({
        password_confirmation: 'Passwords do not match.',
      });
      setSuccessMessage(null);
      setErrorMessage('Passwords do not match.');
      return;
    }

    setFieldErrors({});
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const result = await changePassword(currentPassword, newPassword, confirmNewPassword);

    if (!result.success) {
      setIsSubmitting(false);
      setSuccessMessage(null);
      setErrorMessage(result.error);
      setFieldErrors(result.fieldErrors ?? {});

      if (result.forceLogout) {
        try {
          await signOut();
        } finally {
          router.replace('/(auth)/login');
        }
      }

      return;
    }

    setFieldErrors({});
    setErrorMessage(null);
    setSuccessMessage(result.message);

    await new Promise((resolve) => {
      setTimeout(resolve, SUCCESS_REDIRECT_DELAY_MS);
    });

    try {
      await signOut();
    } finally {
      setIsSubmitting(false);
      router.replace('/(auth)/login');
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Pressable
                style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
                onPress={() => {
                  if (!isSubmitting) {
                    router.back();
                  }
                }}>
                <MaterialCommunityIcons name="chevron-left" size={26} color="#1A1A1A" />
              </Pressable>
              <Text style={styles.headerTitle}>Change Password</Text>
              <View style={styles.headerSpacer} />
            </View>

            <Text style={styles.title}>Update your account password</Text>
            <Text style={styles.subtitle}>
              For your security, you will be signed out after your password is updated.
            </Text>

            {!!successMessage && <Text style={styles.successText}>{successMessage}</Text>}
            {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

            <SectionCard style={styles.formCard}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Current Password</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="lock-outline" size={20} color="#8A8A8A" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter current password"
                    placeholderTextColor="#B0B0B0"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="password"
                    secureTextEntry={!showCurrentPassword}
                    value={currentPassword}
                    onChangeText={handleCurrentPasswordChange}
                  />
                  <Pressable
                    style={styles.eyeIcon}
                    onPress={() => setShowCurrentPassword((previousValue) => !previousValue)}>
                    <MaterialCommunityIcons
                      name={showCurrentPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#8A8A8A"
                    />
                  </Pressable>
                </View>
                {fieldErrors.current_password ? (
                  <Text style={styles.fieldErrorText}>{fieldErrors.current_password}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="shield-key-outline" size={20} color="#8A8A8A" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
                    placeholderTextColor="#B0B0B0"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="newPassword"
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={handleNewPasswordChange}
                  />
                  <Pressable
                    style={styles.eyeIcon}
                    onPress={() => setShowNewPassword((previousValue) => !previousValue)}>
                    <MaterialCommunityIcons
                      name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#8A8A8A"
                    />
                  </Pressable>
                </View>
                <Text style={styles.helperText}>Minimum 8 characters, including one uppercase letter and one number.</Text>
                {fieldErrors.password ? <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text> : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm New Password</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="shield-check-outline" size={20} color="#8A8A8A" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter new password"
                    placeholderTextColor="#B0B0B0"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="password"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmNewPassword}
                    onChangeText={handleConfirmPasswordChange}
                  />
                  <Pressable
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword((previousValue) => !previousValue)}>
                    <MaterialCommunityIcons
                      name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#8A8A8A"
                    />
                  </Pressable>
                </View>
                {fieldErrors.password_confirmation ? (
                  <Text style={styles.fieldErrorText}>{fieldErrors.password_confirmation}</Text>
                ) : null}
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  (isSubmitting || !!successMessage) && styles.submitButtonDisabled,
                  pressed && !(isSubmitting || !!successMessage) && styles.pressed,
                ]}
                onPress={() => {
                  void handleChangePassword();
                }}
                disabled={isSubmitting || !!successMessage}>
                {isSubmitting ? <ActivityIndicator size="small" color="#FFFFFF" style={styles.submitSpinner} /> : null}
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Changing Password...' : 'Change Password'}
                </Text>
              </Pressable>
            </SectionCard>
          </ScrollView>
        </KeyboardAvoidingView>
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
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 14,
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
  formCard: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  inputContainer: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 12,
    minHeight: 48,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
  },
  eyeIcon: {
    padding: 4,
  },
  helperText: {
    fontSize: 11,
    color: '#7C7C7C',
    lineHeight: 16,
    marginTop: 6,
  },
  fieldErrorText: {
    marginTop: 6,
    fontSize: 12,
    color: '#C83B2D',
    fontWeight: '600',
    lineHeight: 17,
  },
  submitButton: {
    marginTop: 4,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#AC1D10',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  submitButtonDisabled: {
    opacity: 0.75,
  },
  submitSpinner: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
