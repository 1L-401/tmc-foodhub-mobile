import { Stack } from 'expo-router';

export default function AuthStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
    </Stack>
  );
}
