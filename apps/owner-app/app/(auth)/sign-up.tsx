import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
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
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TmcLogo } from '@/components/tmc-logo';

export default function SignUpScreen() {
  const [restaurantName, setRestaurantName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

          {/* Titles */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.titleSection}>
            <Text style={styles.title}>Create Owner Account</Text>
            <Text style={styles.subtitle}>
              Register your restaurant and start managing orders today.
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Restaurant Name</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="storefront-outline" size={20} color="#A0A0A0" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. The Good Food Place"
                  placeholderTextColor="#A0A0A0"
                  value={restaurantName}
                  onChangeText={setRestaurantName}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Owner Name</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="account-outline" size={20} color="#A0A0A0" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Juan Dela Cruz"
                  placeholderTextColor="#A0A0A0"
                  value={ownerName}
                  onChangeText={setOwnerName}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="email-outline" size={20} color="#A0A0A0" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. owner@restaurant.com"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="phone-outline" size={20} color="#A0A0A0" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. +63 912 345 6789"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="lock-outline" size={20} color="#A0A0A0" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Create a strong password"
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
            </View>

            <Pressable
              style={styles.signUpButton}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.signUpButtonText}>Create Account</Text>
            </Pressable>
          </Animated.View>

          {/* Login Link */}
          <Animated.View entering={FadeInUp.delay(250).springify()} style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Pressable onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLinkText}>Login</Text>
            </Pressable>
          </Animated.View>

          {/* Footer Terms */}
          <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.footerContainer}>
            <Text style={styles.footerText}>
              By creating an account, you accept our{' '}
              <Text style={styles.footerLinkText}>Terms & Conditions</Text>
            </Text>
            <Text style={styles.footerText}>
              and <Text style={styles.footerLinkText}>Privacy Policy</Text>
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, position: 'relative', height: 70,
  },
  backButton: { position: 'absolute', left: 0, zIndex: 1, padding: 4, marginLeft: -4 },
  logoContainer: { alignItems: 'center', justifyContent: 'center' },
  titleSection: { marginTop: 16, marginBottom: 24, alignItems: 'flex-start' },
  title: { fontSize: 28, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#666666', lineHeight: 24 },
  formSection: { width: '100%' },
  inputContainer: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E5E5',
    borderRadius: 12, paddingHorizontal: 14, height: 52, backgroundColor: '#FAFAFA',
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#1A1A1A' },
  eyeIcon: { padding: 4 },
  signUpButton: {
    backgroundColor: '#AC1D10', borderRadius: 12, height: 52,
    alignItems: 'center', justifyContent: 'center', marginTop: 12,
  },
  signUpButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  loginContainer: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 32,
  },
  loginText: { fontSize: 15, color: '#666666' },
  loginLinkText: { fontSize: 15, fontWeight: '700', color: '#AC1D10' },
  footerContainer: { alignItems: 'center', marginTop: 'auto' },
  footerText: { fontSize: 12, color: '#888888', lineHeight: 18, textAlign: 'center' },
  footerLinkText: { color: '#AC1D10', fontWeight: '600', textDecorationLine: 'underline' },
});
