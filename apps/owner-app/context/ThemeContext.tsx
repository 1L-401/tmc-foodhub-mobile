import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SystemUI from 'expo-system-ui';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, Platform, useColorScheme as useNativeColorScheme } from 'react-native';

type OwnerThemeMode = 'light' | 'dark';

export type OwnerThemeColors = {
  accent: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  mutedText: string;
  subtleText: string;
  border: string;
  divider: string;
  icon: string;
  pressed: string;
  avatarBackground: string;
  danger: string;
  dangerSurface: string;
};

type OwnerThemeContextValue = {
  mode: OwnerThemeMode;
  resolvedTheme: OwnerThemeMode;
  isDarkMode: boolean;
  colors: OwnerThemeColors;
  navigationTheme: Theme;
  setDarkMode: (enabled: boolean) => void;
  toggleDarkMode: () => void;
};

const STORAGE_KEY = 'owner_theme_mode';
const ACCENT = '#AC1D10';

const OWNER_THEME_COLORS: Record<OwnerThemeMode, OwnerThemeColors> = {
  light: {
    accent: ACCENT,
    background: '#FFFFFF',
    surface: '#F8F8F8',
    card: '#FFFFFF',
    text: '#1A1A1A',
    mutedText: '#777777',
    subtleText: '#999999',
    border: '#F0F0F0',
    divider: '#F0F0F0',
    icon: '#555555',
    pressed: '#F3F4F6',
    avatarBackground: '#F0F0F0',
    danger: ACCENT,
    dangerSurface: '#FFF5F4',
  },
  dark: {
    accent: '#F87171',
    background: '#0F1115',
    surface: '#151821',
    card: '#1B1F2A',
    text: '#F8FAFC',
    mutedText: '#CBD5E1',
    subtleText: '#94A3B8',
    border: '#2A3140',
    divider: '#242A36',
    icon: '#CBD5E1',
    pressed: '#242A36',
    avatarBackground: '#F7E8E6',
    danger: '#FCA5A5',
    dangerSurface: '#2A1517',
  },
};

const OwnerThemeContext = createContext<OwnerThemeContextValue | null>(null);

async function readStoredMode(): Promise<OwnerThemeMode | null> {
  try {
    if (Platform.OS === 'web') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'dark' || stored === 'light' ? stored : null;
    }

    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored === 'dark' || stored === 'light' ? stored : null;
  } catch {
    return null;
  }
}

async function writeStoredMode(mode: OwnerThemeMode) {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(STORAGE_KEY, mode);
      return;
    }

    await AsyncStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Theme persistence should never block the app from rendering.
  }
}

function getInitialMode(): OwnerThemeMode {
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

function buildNavigationTheme(mode: OwnerThemeMode, colors: OwnerThemeColors): Theme {
  const baseTheme = mode === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...baseTheme,
    dark: mode === 'dark',
    colors: {
      ...baseTheme.colors,
      primary: colors.accent,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.accent,
    },
  };
}

export function OwnerThemeProvider({ children }: { children: React.ReactNode }) {
  const nativeColorScheme = useNativeColorScheme();
  const [mode, setMode] = useState<OwnerThemeMode>(getInitialMode);

  useEffect(() => {
    let isMounted = true;

    readStoredMode().then((storedMode) => {
      if (isMounted && storedMode) {
        setMode(storedMode);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (nativeColorScheme === 'dark' || nativeColorScheme === 'light') {
      readStoredMode().then((storedMode) => {
        if (!storedMode) {
          setMode(nativeColorScheme);
        }
      });
    }
  }, [nativeColorScheme]);

  const colors = OWNER_THEME_COLORS[mode];

  useEffect(() => {
    if (typeof Appearance.setColorScheme === 'function') {
      Appearance.setColorScheme(mode);
    }

    if (Platform.OS === 'web') {
      document.documentElement.style.colorScheme = mode;
      document.documentElement.dataset.ownerTheme = mode;
      return;
    }

    void SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background, mode]);

  const setDarkMode = useCallback((enabled: boolean) => {
    const nextMode: OwnerThemeMode = enabled ? 'dark' : 'light';
    setMode(nextMode);
    void writeStoredMode(nextMode);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(mode !== 'dark');
  }, [mode, setDarkMode]);

  const value = useMemo<OwnerThemeContextValue>(
    () => ({
      mode,
      resolvedTheme: mode,
      isDarkMode: mode === 'dark',
      colors,
      navigationTheme: buildNavigationTheme(mode, colors),
      setDarkMode,
      toggleDarkMode,
    }),
    [colors, mode, setDarkMode, toggleDarkMode],
  );

  return (
    <OwnerThemeContext.Provider value={value}>
      {children}
    </OwnerThemeContext.Provider>
  );
}

export function useOwnerTheme() {
  const context = useContext(OwnerThemeContext);

  if (!context) {
    throw new Error('useOwnerTheme must be used within OwnerThemeProvider.');
  }

  return context;
}

export function useOptionalOwnerTheme() {
  return useContext(OwnerThemeContext);
}
