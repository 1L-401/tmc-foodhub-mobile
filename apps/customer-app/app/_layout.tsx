import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { CartProvider } from '@/components/cart';
import { PaymentProvider } from '@/components/payment';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PaymentProvider>
        <CartProvider>
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
        </CartProvider>
      </PaymentProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
