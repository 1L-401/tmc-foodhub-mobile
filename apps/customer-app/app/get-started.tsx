import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TmcLogo } from '@/components/tmc-logo';

const FEATURES = [
  {
    icon: 'storefront-outline',
    text: '100+ Local Restaurants',
  },
  {
    icon: 'bike-fast',
    text: 'Real-Time Order Tracking',
  },
  {
    icon: 'tag-outline',
    text: 'Exclusive Deals & Promos',
  },
] as const;

export default function GetStartedScreen() {
  return (
    <ImageBackground
      source={require('@/assets/images/main_hero.png')}
      style={styles.background}
      imageStyle={styles.backgroundImage}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.overlay} />
        <View style={styles.bottomGlow} />

        <View style={styles.content}>
          <View style={styles.header}>
            <TmcLogo width={70} height={70} />
          </View>

          <View style={styles.body}>
            <View style={styles.copyBlock}>
              <Text style={styles.title}>Hungry? You&apos;re in the Right Place.</Text>
              <Text style={styles.subtitle}>
                Browse menus, place orders, track deliveries, earn rewards.
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

            <Text style={styles.footer}>© 2026 TMC Foodhub. All Rights Reserved.</Text>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#1E140E',
    overflow: 'hidden',
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  safeArea: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 11, 7, 0.48)',
  },
  bottomGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '48%',
    backgroundColor: 'rgba(12, 7, 5, 0.5)',
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
