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


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldTouchedState = {
  email: boolean;
  password: boolean;
};

const colors = {
  pageBackground: '#FFFFFF',
  title: '#1A1A1A',
  subtitle: '#666666',
  logoBackground: '#AC1D10',
  logoText: '#FFFFFF',
  accentText: '#AC1D10',
  buttonText: '#FFFFFF',
  buttonDisabled: '#D6A39C',
  buttonPrimary: '#AC1D10',
  helperText: '#A0A0A0',
  errorBackground: '#FDECEA',
  errorText: '#C83B2D',
};

export default function LoginScreen() {

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

          <Animated.View entering={FadeInDown.delay(180).duration(420)} style={styles.formSection}>
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
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  brandText: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subHeading: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  formSection: {
    width: '100%',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  errorBanner: {
    marginTop: 4,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  submitButton: {
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
  },
  footerBlock: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 13,
    marginBottom: 4,
  },
  footerHighlight: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
});
