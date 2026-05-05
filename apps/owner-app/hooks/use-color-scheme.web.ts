import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { useOptionalOwnerTheme } from '@/context/ThemeContext';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const ownerTheme = useOptionalOwnerTheme();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (ownerTheme) {
    return ownerTheme.resolvedTheme;
  }

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
