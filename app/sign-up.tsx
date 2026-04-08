import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { GoogleLogo } from '@/components/google-logo';
import { TmcLogo } from '@/components/tmc-logo';

export default function SignUpScreen() {
  const [userType, setUserType] = useState<'customer' | 'partner'>('customer');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.header}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <MaterialCommunityIcons name="chevron-left" size={32} color="#000" />
            </Pressable>
            <View style={styles.logoContainer}>
              <TmcLogo width={60} height={60} />
            </View>
          </Animated.View>

          {/* Title & Progress */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.titleSection}>
            <Text style={styles.title}>Sign up as a Customer or Restaurant Partner</Text>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: '33%' }]} />
              </View>
              <View style={styles.progressTextRow}>
                <Text style={styles.progressStepText}>Step 1 of 3: Personal Information</Text>
                <Text style={styles.progressPercentageText}>33% Complete</Text>
              </View>
            </View>
            
            <View style={styles.titleDivider} />
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.formSection}>
            {/* Segmented Control */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>I am a...</Text>
              <View style={styles.segmentedControl}>
                <Pressable
                  style={[
                    styles.segmentButton,
                    userType === 'customer' && styles.segmentButtonActive,
                  ]}
                  onPress={() => setUserType('customer')}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      userType === 'customer' && styles.segmentTextActive,
                    ]}
                  >
                    Customer
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.segmentButton,
                    userType === 'partner' && styles.segmentButtonActive,
                  ]}
                  onPress={() => setUserType('partner')}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      userType === 'partner' && styles.segmentTextActive,
                    ]}
                  >
                    Restaurant Partner
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Name Row */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
              <View style={styles.nameRow}>
                <View style={[styles.inputWrapper, { flex: 1, marginRight: 8, paddingHorizontal: 14 }]}>
                  <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    placeholderTextColor="#A0A0A0"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>
                <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8, paddingHorizontal: 14 }]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    placeholderTextColor="#A0A0A0"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrapper, { paddingHorizontal: 14 }]}>
                <MaterialCommunityIcons
                  name="email-outline"
                  size={20}
                  color="#A0A0A0"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. you@example.com"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrapper, { paddingHorizontal: 14 }]}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={20}
                  color="#A0A0A0"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#A0A0A0"
                  secureTextEntry={!showPassword}
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
              <Text style={styles.helperText}>
                Must be at least 8 characters with a symbol & number
              </Text>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={[styles.inputWrapper, { paddingHorizontal: 14 }]}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={20}
                  color="#A0A0A0"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor="#A0A0A0"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <Pressable
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <MaterialCommunityIcons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#A0A0A0"
                  />
                </Pressable>
              </View>
            </View>

            {/* Agreements */}
            <View style={styles.agreementsContainer}>
              <Pressable
                style={styles.checkboxContainer}
                onPress={() => setAgreedToTerms(!agreedToTerms)}
              >
                <View style={[styles.checkbox, agreedToTerms && styles.checkboxActive]}>
                  {agreedToTerms && (
                    <MaterialCommunityIcons name="check" size={14} color="#FFF" />
                  )}
                </View>
                <Text style={styles.agreementText}>
                  I agree to the <Text style={styles.redLink}>Terms of Service</Text> and{' '}
                  <Text style={styles.redLink}>Privacy Policy</Text>
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={styles.nextButton}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.nextButtonText}>Next Step</Text>
            </Pressable>
          </Animated.View>

          {/* Divider */}
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
            <View style={styles.dividerLine} />
          </Animated.View>

          {/* Social Logins */}
          <Animated.View entering={FadeInDown.delay(250).springify()} style={styles.socialSection}>
            <Pressable
              style={styles.socialButton}
              onPress={() => router.replace('/(tabs)')}
            >
              <GoogleLogo />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </Pressable>
            <Pressable
              style={styles.socialButton}
              onPress={() => router.replace('/(tabs)')}
            >
              <MaterialCommunityIcons name="facebook" size={24} color="#4267B2" />
              <Text style={styles.socialButtonText}>Continue with Facebook</Text>
            </Pressable>
          </Animated.View>

          {/* Login Link */}
          <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.loginLinkContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Pressable onPress={() => router.replace('/login')}>
              <Text style={styles.loginLinkText}>Log in</Text>
            </Pressable>
          </Animated.View>

          {/* Bottom Space for padding symmetry */}
          <View style={{ height: 24 }} />
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
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
    height: 70,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
    padding: 4,
    marginLeft: -4,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    marginTop: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
    lineHeight: 28,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#EEEEEE',
    borderRadius: 3,
    marginBottom: 8,
    width: '100%',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#AC1D10',
    borderRadius: 3,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressStepText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  progressPercentageText: {
    fontSize: 13,
    color: '#AC1D10',
    fontWeight: '700',
  },
  titleDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    width: '100%',
  },
  formSection: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A0A0A0',
  },
  segmentTextActive: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    height: 52,
    backgroundColor: '#FAFAFA',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
  },
  eyeIcon: {
    padding: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#888888',
    marginTop: 6,
  },
  agreementsContainer: {
    marginBottom: 24,
    marginTop: 6,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#D4D4D4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#FFF',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#AC1D10',
    borderColor: '#AC1D10',
  },
  agreementText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#4A4A4A',
  },
  redLink: {
    color: '#AC1D10',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#AC1D10',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  dividerText: {
    color: '#A0A0A0',
    paddingHorizontal: 16,
    fontSize: 12,
    fontWeight: '500',
  },
  socialSection: {
    gap: 16,
    marginBottom: 32,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    height: 52,
    backgroundColor: '#FFFFFF',
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 12,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 15,
    color: '#666666',
  },
  loginLinkText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#AC1D10',
  },
});
