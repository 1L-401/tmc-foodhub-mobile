import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
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

const OTP_LENGTH = 6;

export default function VerifyCodeScreen() {
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const hiddenInputRef = useRef<TextInput>(null);

  const handleCodeChange = (value: string) => {
    const numericCode = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setCode(numericCode);

    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleVerify = () => {
    if (code.length !== OTP_LENGTH) {
      setErrorMessage('Please enter the 6-digit code.');
      return;
    }

    setErrorMessage('');
    router.push('/create-new-password');
  };

  const handleResend = () => {
    setCode('');
    setErrorMessage('');
    hiddenInputRef.current?.focus();
  };

  const isCodeComplete = code.length === OTP_LENGTH;

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
              We&apos;ve sent a 6-digit code to your email address. Enter it below to verify your
              account.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).springify()} style={styles.formSection}>
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

            <Pressable
              style={[styles.submitButton, !isCodeComplete && styles.submitButtonDisabled]}
              onPress={handleVerify}
              disabled={!isCodeComplete}>
              <Text
                style={[
                  styles.submitButtonText,
                  !isCodeComplete && styles.submitButtonTextDisabled,
                ]}>
                Verify Code
              </Text>
            </Pressable>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn&apos;t receive the code? </Text>
              <Pressable onPress={handleResend}>
                <Text style={styles.resendLink}>Resend (30s)</Text>
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
