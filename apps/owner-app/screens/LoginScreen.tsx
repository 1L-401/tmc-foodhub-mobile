import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthInput } from '@/components/ui/auth-input';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldTouchedState = {
  email: boolean;
  password: boolean;
};

const palette = {
  light: {
    pageBackground: '#F3F6FB',
    cardBackground: '#FFFFFF',
    cardBorder: '#E2E8F0',
    title: '#0F172A',
    subtitle: '#475569',
    logoBackground: '#AC1D10',
    logoText: '#FFFFFF',
    accentText: '#AC1D10',
    buttonText: '#FFFFFF',
    buttonDisabled: '#B8C3D0',
    buttonPrimary: '#AC1D10',
    helperText: '#64748B',
    errorBackground: '#FEE4E2',
    errorText: '#B42318',
  },
  dark: {
    pageBackground: '#020617',
    cardBackground: '#0F172A',
    cardBorder: '#334155',
    title: '#F8FAFC',
    subtitle: '#CBD5E1',
    logoBackground: '#D84134',
    logoText: '#FFFFFF',
    accentText: '#F97367',
    buttonText: '#FFFFFF',
    buttonDisabled: '#475569',
    buttonPrimary: '#D84134',
    helperText: '#94A3B8',
    errorBackground: '#3F1D1D',
    errorText: '#FCA5A5',
  },
} as const;

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = colorScheme === 'dark' ? palette.dark : palette.light;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [touched, setTouched] = useState<FieldTouchedState>({ email: false, password: false });

  const { login, isHydrating } = useAuth();

  const normalizedEmail = email.trim();

  const emailError = useMemo(() => {
    const shouldShowError = touched.email || attemptedSubmit;

    if (!shouldShowError) {
      return undefined;
    }

    if (!normalizedEmail) {
      return 'Email is required.';
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return 'Please enter a valid email address.';
    }

    return undefined;
  }, [attemptedSubmit, normalizedEmail, touched.email]);

  const passwordError = useMemo(() => {
    const shouldShowError = touched.password || attemptedSubmit;

    if (!shouldShowError) {
      return undefined;
    }

    if (!password.trim()) {
      return 'Password is required.';
    }

    return undefined;
  }, [attemptedSubmit, password, touched.password]);

  const isFormValid = EMAIL_REGEX.test(normalizedEmail) && password.trim().length > 0;
  const isButtonDisabled = isHydrating || isSubmitting || !isFormValid;

  const handleEmailBlur = useCallback(() => {
    setTouched((prev) => ({ ...prev, email: true }));
  }, []);

  const handlePasswordBlur = useCallback(() => {
    setTouched((prev) => ({ ...prev, password: true }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setAttemptedSubmit(true);
    setTouched({ email: true, password: true });

    if (!isFormValid) {
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    const result = await login(normalizedEmail, password);

    setIsSubmitting(false);

    if (result.success) {
      router.replace('/(owner)/dashboard');
      return;
    }

    setSubmitError(result.error);
  }, [isFormValid, login, normalizedEmail, password]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.pageBackground }]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          bounces={false}
          contentContainerStyle={styles.scrollContent}>
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.headerBlock}>
            <View style={[styles.logoContainer, { backgroundColor: colors.logoBackground }]}>
              <Text style={[styles.logoText, { color: colors.logoText }]}>TMC</Text>
            </View>

            <Text style={[styles.brandText, { color: colors.title }]}>Foodhub Owner</Text>
            <Text style={[styles.subHeading, { color: colors.subtitle }]}>Sign in to manage your restaurant operations.</Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(180).duration(420)}
            style={[
              styles.card,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.cardBorder,
              },
            ]}>
            <Text style={[styles.cardTitle, { color: colors.title }]}>Welcome back</Text>
            <Text style={[styles.cardSubtitle, { color: colors.helperText }]}>Use your owner credentials to continue.</Text>

            <AuthInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              onBlur={handleEmailBlur}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              returnKeyType="next"
              placeholder="owner@restaurant.com"
              leftIcon={<MaterialCommunityIcons name="email-outline" size={18} color={colors.helperText} />}
              error={emailError}
            />

            <AuthInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              onBlur={handlePasswordBlur}
              secureTextEntry={!showPassword}
              textContentType="password"
              autoComplete="password"
              returnKeyType="done"
              placeholder="Enter your password"
              leftIcon={<MaterialCommunityIcons name="lock-outline" size={18} color={colors.helperText} />}
              rightIcon={
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colors.helperText}
                />
              }
              onRightIconPress={() => setShowPassword((prev) => !prev)}
              error={passwordError}
            />

            {submitError ? (
              <View style={[styles.errorBanner, { backgroundColor: colors.errorBackground }]}>
                <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.errorText} />
                <Text style={[styles.errorBannerText, { color: colors.errorText }]}>{submitError}</Text>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              onPress={handleSubmit}
              disabled={isButtonDisabled}
              style={({ pressed }) => [
                styles.submitButton,
                {
                  backgroundColor: isButtonDisabled ? colors.buttonDisabled : colors.buttonPrimary,
                  opacity: pressed && !isButtonDisabled ? 0.9 : 1,
                },
              ]}>
              {isSubmitting ? (
                <ActivityIndicator size="small" color={colors.buttonText} />
              ) : (
                <Text style={[styles.submitText, { color: colors.buttonText }]}>Login</Text>
              )}
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(240).duration(420)} style={styles.footerBlock}>
            <Text style={[styles.footerText, { color: colors.helperText }]}>Need access?</Text>
            <Text style={[styles.footerHighlight, { color: colors.accentText }]}>Contact TMC support to activate owner credentials.</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    width: 62,
    height: 62,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  brandText: {
    fontSize: 23,
    fontWeight: '800',
    marginBottom: 4,
  },
  subHeading: {
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    marginBottom: 18,
  },
  errorBanner: {
    marginTop: 4,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
  },
  submitButton: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
  },
  footerBlock: {
    alignItems: 'center',
    marginTop: 18,
  },
  footerText: {
    fontSize: 12,
    marginBottom: 2,
  },
  footerHighlight: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
