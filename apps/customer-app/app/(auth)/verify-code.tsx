import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { useAuth } from '@/contexts/auth-context';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

export default function VerifyCodeScreen() {
  const { requestPasswordReset, verifyPasswordResetOtp } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(RESEND_COOLDOWN_SECONDS);
  const hiddenInputRef = useRef<TextInput>(null);

  const normalizedEmail = useMemo(() => {
    const rawEmail = params.email;

    if (typeof rawEmail !== 'string') {
      return '';
    }

    return rawEmail.trim().toLowerCase();
  }, [params.email]);

  useEffect(() => {
    if (resendCountdown <= 0) {
      return;
    }

    const timeout = setTimeout(() => {
      setResendCountdown((previousValue) => Math.max(previousValue - 1, 0));
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [resendCountdown]);

  const handleCodeChange = (value: string) => {
    const numericCode = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setCode(numericCode);

    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleVerify = async () => {
    if (isVerifying) {
      return;
    }

    if (!normalizedEmail) {
      setErrorMessage('Missing email. Please go back and request a new reset code.');
      return;
    }

    if (code.length !== OTP_LENGTH) {
      setErrorMessage('Please enter the 6-digit code.');
      return;
    }

    setErrorMessage(null);
    setStatusMessage(null);
    setIsVerifying(true);

    const result = await verifyPasswordResetOtp(normalizedEmail, code);

    setIsVerifying(false);

    if (!result.success) {
      setErrorMessage(result.error);
      return;
    }

    router.push({
      pathname: '/(auth)/create-new-password',
      params: {
        resetToken: result.resetToken,
        email: normalizedEmail,
      },
    });
  };

  const handleResend = async () => {
    if (resendCountdown > 0 || isResending) {
      return;
    }

    if (!normalizedEmail) {
      setErrorMessage('Missing email. Please go back and request a new reset code.');
      return;
    }

    setErrorMessage(null);
    setStatusMessage(null);
    setIsResending(true);

    const result = await requestPasswordReset(normalizedEmail);

    setIsResending(false);

    if (!result.success) {
      setErrorMessage(result.error);
      return;
    }

    setCode('');
    setStatusMessage(result.message);
    setResendCountdown(RESEND_COOLDOWN_SECONDS);
    hiddenInputRef.current?.focus();
  };

  const isCodeComplete = code.length === OTP_LENGTH;
  const isSubmitDisabled = !isCodeComplete || isVerifying || !normalizedEmail;
  const isResendDisabled = resendCountdown > 0 || isResending;

  const resendLabel = isResending
    ? 'Sending...'
    : resendCountdown > 0
      ? `Resend (${resendCountdown}s)`
      : 'Resend Code';

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
            <Text style={styles.title}>Verify your email</Text>
            <Text style={styles.subtitle}>
              We&apos;ve sent a 6-digit code to your email address. Enter it below to continue your
              password reset.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).springify()} style={styles.formSection}>
            {!normalizedEmail && (
              <Text style={styles.errorText}>
                Missing email context. Please go back and request a reset code again.
              </Text>
            )}

            <Pressable style={styles.otpRow} onPress={() => hiddenInputRef.current?.focus()}>
              {Array.from({ length: OTP_LENGTH }).map((_, index) => {
                const digit = code[index];
                const isFilled = Boolean(digit);

                return (
                  <View key={index} style={[styles.otpCell, isFilled && styles.otpCellFilled]}>
                    <Text
                      style={[
                        styles.otpCellText,
                        isFilled ? styles.otpCellTextFilled : styles.otpCellTextEmpty,
                      ]}>
                      {digit ?? '0'}
                    </Text>
                  </View>
                );
              })}
            </Pressable>

            <TextInput
              ref={hiddenInputRef}
              style={styles.hiddenInput}
              value={code}
              onChangeText={handleCodeChange}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              maxLength={OTP_LENGTH}
            />

            {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
            {!!statusMessage && <Text style={styles.statusText}>{statusMessage}</Text>}

            <Pressable
              style={[styles.submitButton, isSubmitDisabled && styles.submitButtonDisabled]}
              onPress={() => {
                void handleVerify();
              }}
              disabled={isSubmitDisabled}>
              <Text
                style={[
                  styles.submitButtonText,
                  isSubmitDisabled && styles.submitButtonTextDisabled,
                ]}>
                {isVerifying ? 'Verifying...' : 'Verify Code'}
              </Text>
            </Pressable>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn&apos;t receive the code? </Text>
              <Pressable
                onPress={() => {
                  void handleResend();
                }}
                disabled={isResendDisabled}>
                <Text style={[styles.resendLink, isResendDisabled && styles.resendLinkDisabled]}>
                  {resendLabel}
                </Text>
              </Pressable>
            </View>

            <View style={styles.helpCard}>
              <Text style={styles.helpTitle}>Didn&apos;t get the email?</Text>
              <Text style={styles.helpText}>
                Check your spam folder, or <Text style={styles.helpLink}>resend the code</Text>{' '}
                after the timer ends. You can also <Text style={styles.helpLink}>change your email
                address</Text>.
              </Text>
            </View>
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
    paddingBottom: 24,
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
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  otpCell: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpCellFilled: {
    borderColor: '#E2C3C0',
  },
  otpCellText: {
    fontSize: 16,
    fontWeight: '600',
  },
  otpCellTextFilled: {
    color: '#AC1D10',
  },
  otpCellTextEmpty: {
    color: '#B8B8B8',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
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
  errorText: {
    color: '#C53030',
    fontSize: 12,
    marginBottom: 10,
  },
  statusText: {
    color: '#1E7A38',
    fontSize: 12,
    marginBottom: 10,
  },
  resendContainer: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendText: {
    fontSize: 12,
    color: '#8A8A8A',
  },
  resendLink: {
    fontSize: 12,
    color: '#AC1D10',
    fontWeight: '700',
  },
  resendLinkDisabled: {
    color: '#B8B8B8',
  },
  helpCard: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FCFCFC',
  },
  helpTitle: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '700',
    marginBottom: 6,
  },
  helpText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#7A7A7A',
  },
  helpLink: {
    color: '#AC1D10',
    fontWeight: '600',
  },
});
