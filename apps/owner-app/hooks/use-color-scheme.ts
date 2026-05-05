import { useColorScheme as useNativeColorScheme } from 'react-native';

import { useOptionalOwnerTheme } from '@/context/ThemeContext';

export function useColorScheme() {
  const ownerTheme = useOptionalOwnerTheme();
  const nativeColorScheme = useNativeColorScheme();

  return ownerTheme?.resolvedTheme ?? nativeColorScheme ?? 'light';
}
