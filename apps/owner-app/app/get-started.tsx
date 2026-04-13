import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TmcLogo } from '@/components/tmc-logo';

const FEATURES = [
  {
    icon: 'store-cog-outline' as const,
    text: 'Manage Your Restaurant',
  },
  {
    icon: 'chart-line' as const,
    text: 'Track Orders & Revenue',
  },
  {
    icon: 'bell-ring-outline' as const,
    text: 'Real-Time Notifications',
  },
];

export default function GetStartedScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={styles.overlay} />

      <View style={styles.content}>
        <View style={styles.header}>
          <TmcLogo width={70} height={70} />
        </View>

        <View style={styles.body}>
          <View style={styles.copyBlock}>
            <Text style={styles.title}>Manage Your Restaurant with Ease.</Text>
            <Text style={styles.subtitle}>
              Accept orders, manage menus, track earnings, and grow your business.
            </Text>
          </View>

          <View style={styles.features}>
            {FEATURES.map((feature) => (
              <View key={feature.text} style={styles.featureRow}>
                <View style={styles.featureIconWrap}>
                  <MaterialCommunityIcons
                    name={feature.icon}
                    size={18}
                    color="#F3B321"
                  />
                </View>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>

          <Pressable style={styles.button} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.buttonText}>Get Started</Text>
          </Pressable>

          <Text style={styles.footer}>© 2026 TMC Foodhub. Owner Dashboard.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1A0F0A',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 11, 7, 0.85)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 8,
  },
  body: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 18,
  },
  copyBlock: {
    gap: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 42,
    lineHeight: 46,
    fontWeight: '800',
    letterSpacing: -1.2,
    maxWidth: 320,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
    lineHeight: 28,
    maxWidth: 312,
  },
  features: {
    marginTop: 28,
    gap: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIconWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(243, 179, 33, 0.18)',
  },
  featureText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
  },
  button: {
    marginTop: 32,
    height: 58,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#AC1D10',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  footer: {
    marginTop: 18,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 12,
    lineHeight: 18,
  },
});
