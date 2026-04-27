import { Stack } from 'expo-router';

export default function OwnerStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
    </Stack>
  );
}
