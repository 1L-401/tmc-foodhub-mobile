import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import { loginOwner, type OwnerUser } from '@/services/authService';
import { fetchOwnerProfile } from '@/services/ownerProfileService';

const AUTH_TOKEN_STORAGE_KEY = 'owner.auth.token';
const AUTH_USER_STORAGE_KEY = 'owner.auth.user';
const PROFILE_REFRESH_INTERVAL_MS = 60_000;

type LoginResult =
  | { success: true }
  | {
      success: false;
      error: string;
    };

type LogoutResult =
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
  isProfileRefreshing: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<LogoutResult>;
  refreshOwnerProfile: (tokenOverride?: string) => Promise<void>;
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
  const [isProfileRefreshing, setIsProfileRefreshing] = useState(false);
  const isMountedRef = useRef(true);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
      } catch {
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
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
    await Promise.all([
      AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY),
      AsyncStorage.removeItem(AUTH_USER_STORAGE_KEY),
    ]);
  }, []);

  const refreshOwnerProfile = useCallback(async (tokenOverride?: string) => {
    const activeToken = tokenOverride ?? token;

    if (!activeToken || isRefreshingRef.current) {
      return;
    }

    isRefreshingRef.current = true;

    if (isMountedRef.current) {
      setIsProfileRefreshing(true);
    }

    try {
      const profile = await fetchOwnerProfile(activeToken);

      if (!isMountedRef.current) {
        return;
      }

      setUser(profile);
      await persistAuthSession(activeToken, profile);
    } catch {
      // Keep the existing profile if refresh fails.
    } finally {
      if (isMountedRef.current) {
        setIsProfileRefreshing(false);
      }

      isRefreshingRef.current = false;
    }
  }, [persistAuthSession, token]);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    try {
      const result = await loginOwner({ email, password });
      const resolvedUser: OwnerUser = result.user ?? { email };

      setToken(result.token);
      setUser(resolvedUser);
      await persistAuthSession(result.token, resolvedUser);
      await refreshOwnerProfile(result.token);

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

  const logout = useCallback(async (): Promise<LogoutResult> => {
    let clearError: unknown = null;

    try {
      await clearAuthSession();
    } catch (error) {
      clearError = error;
    } finally {
      setToken(null);
      setUser(null);
    }

    if (clearError) {
      return {
        success: false,
        error: 'Signed out, but failed to fully clear local session data.',
      };
    }

    return { success: true };
  }, [clearAuthSession]);

  useEffect(() => {
    if (isHydrating || !token) {
      return;
    }

    void refreshOwnerProfile();
  }, [isHydrating, refreshOwnerProfile, token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const handleAppStateChange = (nextState: string) => {
      if (nextState === 'active') {
        void refreshOwnerProfile();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    const intervalId = setInterval(() => {
      if (AppState.currentState === 'active') {
        void refreshOwnerProfile();
      }
    }, PROFILE_REFRESH_INTERVAL_MS);

    return () => {
      subscription.remove();
      clearInterval(intervalId);
    };
  }, [refreshOwnerProfile, token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isHydrating,
      isProfileRefreshing,
      isAuthenticated: Boolean(token),
      login,
      logout,
      refreshOwnerProfile,
    }),
    [isHydrating, isProfileRefreshing, login, logout, refreshOwnerProfile, token, user],
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
