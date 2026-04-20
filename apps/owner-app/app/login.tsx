import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function OwnerLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ── Logo ── */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.logoSection}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoText}>TMC</Text>
          </View>
          <Text style={styles.appName}>
            FOOD <Text style={styles.appNameBold}>HUB</Text>
          </Text>
          <Text style={styles.appSub}>Restaurant Owner Portal</Text>
        </Animated.View>

        {/* ── Welcome ── */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={styles.welcomeTitle}>Welcome Back</Text>
          <Text style={styles.welcomeSub}>Sign in to manage your restaurant</Text>
        </Animated.View>

        {/* ── Form ── */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.form}>
          <View style={styles.inputWrap}>
            <MaterialCommunityIcons name="email-outline" size={18} color="#AAA" />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#BBB"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputWrap}>
            <MaterialCommunityIcons name="lock-outline" size={18} color="#AAA" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#BBB"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable hitSlop={10} onPress={() => setShowPassword(!showPassword)}>
              <MaterialCommunityIcons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color="#AAA"
              />
            </Pressable>
          </View>

          <Pressable style={styles.forgotRow}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </Pressable>
        </Animated.View>

        {/* ── Login Button ── */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Pressable
            style={({ pressed }) => [styles.loginBtn, pressed && { opacity: 0.85 }]}
            onPress={handleLogin}
          >
            <Text style={styles.loginBtnText}>Sign In</Text>
          </Pressable>
        </Animated.View>

        {/* ── Footer ── */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <Text style={styles.footerLink}>Contact Admin</Text>
          </Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },

  /* Logo */
  logoSection: { alignItems: 'center', marginBottom: 36 },
  logoIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#AC1D10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  appName: { fontSize: 14, color: '#1A1A1A', fontWeight: '500', letterSpacing: 2 },
  appNameBold: { fontWeight: '900', color: '#AC1D10' },
  appSub: { fontSize: 12, color: '#AAA', marginTop: 4 },

  /* Welcome */
  welcomeTitle: { fontSize: 26, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
  welcomeSub: { fontSize: 14, color: '#888', marginBottom: 28 },

  /* Form */
  form: { marginBottom: 24 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 14,
  },
  input: { flex: 1, fontSize: 14, color: '#1A1A1A' },
  forgotRow: { alignItems: 'flex-end', marginTop: 2 },
  forgotText: { fontSize: 13, fontWeight: '600', color: '#AC1D10' },

  /* Login Button */
  loginBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#AC1D10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },

  /* Footer */
  footer: { alignItems: 'center', marginTop: 24 },
  footerText: { fontSize: 13, color: '#888' },
  footerLink: { color: '#AC1D10', fontWeight: '700' },
});
