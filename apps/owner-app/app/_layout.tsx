import { ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { OwnerThemeProvider, useOwnerTheme } from '@/context/ThemeContext';

const queryClient = new QueryClient();

export const unstable_settings = {
  initialRouteName: '(auth)',
};

function AppStack() {
  const { isAuthenticated, isHydrating } = useAuth();
  const { colors } = useOwnerTheme();
  const segments = useSegments();
  const router = useRouter();

  const rootSegment = segments[0];
  const isOnAuthRoute = rootSegment === '(auth)' || rootSegment === 'login';
  const shouldRedirectToAuth = !isHydrating && !isAuthenticated && !isOnAuthRoute;
  const shouldRedirectToApp = !isHydrating && isAuthenticated && isOnAuthRoute;

  useEffect(() => {
    if (shouldRedirectToAuth) {
      router.replace('/(auth)/login');
      return;
    }

    if (shouldRedirectToApp) {
      router.replace('/(owner)/dashboard');
    }
  }, [router, shouldRedirectToApp, shouldRedirectToAuth]);

  if (isHydrating) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="(owner)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="more"
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_left',
        }}
      />
      <Stack.Screen
        name="order-details"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="inventory"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="categories"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="promotions"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="reviews"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

function ThemedRoot() {
  const { colors, navigationTheme, resolvedTheme } = useOwnerTheme();

  return (
    <ThemeProvider value={navigationTheme}>
      <AuthProvider>
        <AppStack />
      </AuthProvider>
      <StatusBar
        style={resolvedTheme === 'dark' ? 'light' : 'dark'}
        backgroundColor={colors.background}
      />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <OwnerThemeProvider>
        <ThemedRoot />
      </OwnerThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
