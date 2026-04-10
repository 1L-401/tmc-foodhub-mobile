import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TmcLogo } from '@/components/tmc-logo';

export default function CreateNewPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const requirements = useMemo(
    () => [
      {
        key: 'length',
        label: 'At least 8 characters',
        met: password.length >= 8,
      },
      {
        key: 'upperLower',
        label: 'Contains uppercase and lowercase letters',
        met: /[A-Z]/.test(password) && /[a-z]/.test(password),
      },
      {
        key: 'number',
        label: 'Contains at least one number',
        met: /\d/.test(password),
      },
      {
        key: 'special',
        label: 'Contains at least one special character',
        met: /[^A-Za-z0-9]/.test(password),
      },
    ],
    [password]
  );

  const meetsRequirements = requirements.every((item) => item.met);
  const hasConfirmInput = confirmPassword.length > 0;
  const passwordsMatch = password === confirmPassword && hasConfirmInput;
  const showMismatchError = hasConfirmInput && password !== confirmPassword;
  const canSubmit = meetsRequirements && passwordsMatch;

  const handleResetPassword = () => {
    if (!canSubmit) {
      return;
    }

    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.header}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <MaterialCommunityIcons name="chevron-left" size={28} color="#1A1A1A" />
            </Pressable>
            <View style={styles.logoContainer}>
              <TmcLogo width={50} height={50} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120).springify()} style={styles.titleSection}>
            <Text style={styles.title}>Create your new password</Text>
            <Text style={styles.subtitle}>
              Use a strong password to keep your account secure.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).springify()} style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={20}
                  color="#A0A0A0"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  placeholderTextColor="#B3B3B3"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#A0A0A0"
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={20}
                  color="#A0A0A0"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter password"
                  placeholderTextColor="#B3B3B3"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <Pressable
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <MaterialCommunityIcons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#A0A0A0"
                  />
                </Pressable>
              </View>
            </View>

            {showMismatchError && <Text style={styles.errorText}>Passwords do not match.</Text>}

            <View style={styles.requirementsCard}>
              <Text style={styles.requirementsTitle}>Password requirements</Text>
              {requirements.map((item) => (
                <View key={item.key} style={styles.requirementRow}>
                  <MaterialCommunityIcons
                    name={item.met ? 'check-circle' : 'circle-outline'}
                    size={16}
                    color={item.met ? '#1E7A38' : '#A0A0A0'}
                  />
                  <Text
                    style={[
                      styles.requirementText,
                      item.met && styles.requirementTextMet,
                    ]}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>

            <Pressable
              style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
              onPress={handleResetPassword}
              disabled={!canSubmit}>
              <Text
                style={[
                  styles.submitButtonText,
                  !canSubmit && styles.submitButtonTextDisabled,
                ]}>
                Reset Password
              </Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    position: 'relative',
    height: 62,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
    padding: 4,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    marginTop: 16,
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 20,
    maxWidth: 320,
  },
  formSection: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#F7F7F7',
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
  errorText: {
    color: '#C53030',
    fontSize: 12,
    marginBottom: 10,
  },
  requirementsCard: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    backgroundColor: '#FCFCFC',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '700',
    marginBottom: 8,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  requirementText: {
    marginLeft: 8,
    color: '#7A7A7A',
    fontSize: 12,
  },
  requirementTextMet: {
    color: '#1E7A38',
  },
  submitButton: {
    marginTop: 4,
    backgroundColor: '#AC1D10',
    borderRadius: 8,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#DEDEDE',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  submitButtonTextDisabled: {
    color: '#8F8F8F',
  },
});
