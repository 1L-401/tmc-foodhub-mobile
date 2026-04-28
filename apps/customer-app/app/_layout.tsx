import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { CartProvider } from '@/components/cart';
import { OngoingOrderBar } from '@/components/orders/ongoing-order-bar';
import { PaymentProvider } from '@/components/payment';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

const queryClient = new QueryClient();

function RootStack() {
  const segments = useSegments();
  const { isAuthenticated, isReady, user } = useAuth();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const hasCustomerSession = isAuthenticated && user?.role === 'customer';
    const currentSegment = segments[0];
    const inAuthGroup = currentSegment === '(auth)';
    const isPublicRoute = !currentSegment || currentSegment === 'get-started';

    if (!hasCustomerSession && !inAuthGroup && !isPublicRoute) {
      router.replace('/(auth)/login');
      return;
    }

    if (hasCustomerSession && (inAuthGroup || isPublicRoute)) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isReady, segments, user]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#AC1D10" />
      </View>
    );
  }

  return (
    <View style={styles.stackContainer}>
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
        <Stack.Screen name="account-settings" options={{ headerShown: false }} />
        <Stack.Screen name="verify-email" options={{ headerShown: false }} />
        <Stack.Screen name="change-password" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="privacy-security" options={{ headerShown: false }} />
        <Stack.Screen name="notification-settings" options={{ headerShown: false }} />
        <Stack.Screen name="terms-policies" options={{ headerShown: false }} />
        <Stack.Screen name="help-support" options={{ headerShown: false }} />
        <Stack.Screen name="restaurant/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="reviews/[id]" options={{ headerShown: false }} />
      </Stack>

      <OngoingOrderBar />
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <PaymentProvider>
            <CartProvider>
              <RootStack />
            </CartProvider>
          </PaymentProvider>
        </AuthProvider>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  stackContainer: {
    flex: 1,
  },
});
