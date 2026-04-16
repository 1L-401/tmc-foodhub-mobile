import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { CartProvider } from '@/components/cart';
import { PaymentProvider } from '@/components/payment';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

function RootStack() {
  const segments = useSegments();
  const { isAuthenticated, isReady } = useAuth();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const currentSegment = segments[0];
    const inAuthGroup = currentSegment === '(auth)';
    const isPublicRoute = !currentSegment || currentSegment === 'index' || currentSegment === 'get-started';

    if (!isAuthenticated && !inAuthGroup && !isPublicRoute) {
      router.replace('/(auth)/login');
      return;
    }

    if (isAuthenticated && (inAuthGroup || isPublicRoute)) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isReady, segments]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#AC1D10" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="get-started" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="checkout" options={{ headerShown: false }} />
      <Stack.Screen name="order-processing" options={{ headerShown: false }} />
      <Stack.Screen name="payment-failed" options={{ headerShown: false }} />
      <Stack.Screen name="order-tracking/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="delivery-address" options={{ headerShown: false }} />
      <Stack.Screen name="add-address" options={{ headerShown: false }} />
      <Stack.Screen name="add-payment-method" options={{ headerShown: false }} />
      <Stack.Screen name="restaurant/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="reviews/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PaymentProvider>
        <CartProvider>
          <AuthProvider>
            <RootStack />
          </AuthProvider>
        </CartProvider>
      </PaymentProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});
