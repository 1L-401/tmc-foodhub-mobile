import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { TmcLogo } from '@/components/tmc-logo';
import { useAuth } from '@/contexts/auth-context';

const SPLASH_DELAY_MS = 1600;

export default function SplashScreen() {
  const { isAuthenticated, isReady } = useAuth();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const timeoutId = setTimeout(() => {
      router.replace(isAuthenticated ? '/(tabs)' : '/get-started');
    }, SPLASH_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, isReady]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        <TmcLogo width={168} height={168} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#7A190F',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 36,
    backgroundColor: '#7A190F',
  },
});
