import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { loginOwner, type OwnerUser } from '@/services/authService';

const AUTH_TOKEN_STORAGE_KEY = 'owner.auth.token';
const AUTH_USER_STORAGE_KEY = 'owner.auth.user';

type LoginResult =
  | { success: true }
  | {
      success: false;
      error: string;
    };

type AuthContextValue = {
  token: string | null;
  user: OwnerUser | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function parseStoredUser(value: string | null): OwnerUser | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as OwnerUser;
    }

    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<OwnerUser | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const hydrateAuthState = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY),
          AsyncStorage.getItem(AUTH_USER_STORAGE_KEY),
        ]);

        if (!isMounted) {
          return;
        }

        setToken(storedToken);
        setUser(parseStoredUser(storedUser));
      } finally {
        if (isMounted) {
          setIsHydrating(false);
        }
      }
    };

    void hydrateAuthState();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistAuthSession = useCallback(async (nextToken: string, nextUser: OwnerUser | null) => {
    const writeTasks = [AsyncStorage.setItem(AUTH_TOKEN_STORAGE_KEY, nextToken)];

    if (nextUser) {
      writeTasks.push(AsyncStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(nextUser)));
    } else {
      writeTasks.push(AsyncStorage.removeItem(AUTH_USER_STORAGE_KEY));
    }

    await Promise.all(writeTasks);
  }, []);

  const clearAuthSession = useCallback(async () => {
    await AsyncStorage.multiRemove([AUTH_TOKEN_STORAGE_KEY, AUTH_USER_STORAGE_KEY]);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    try {
      const result = await loginOwner({ email, password });
      const resolvedUser: OwnerUser = result.user ?? { email };

      setToken(result.token);
      setUser(resolvedUser);
      await persistAuthSession(result.token, resolvedUser);

      return { success: true };
    } catch (error) {
      const fallbackMessage = 'Unable to sign in right now. Please try again.';
      const errorMessage = error instanceof Error ? error.message : fallbackMessage;

      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [persistAuthSession]);

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    await clearAuthSession();
  }, [clearAuthSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isHydrating,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [isHydrating, login, logout, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
