import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const LOGIN_URL = 'https://foodhub.tmc-innovations.com/api/login';

type AuthUser = {
  id: number;
  name: string;
  email: string;
  role?: string;
};

type SignInResult =
  | { success: true }
  | {
      success: false;
      error: string;
    };

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isReady: boolean;
  signInWithCredentials: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getServerErrorMessage(payload: unknown): string | null {
  if (!payload) {
    return null;
  }

  if (typeof payload === 'string') {
    return payload.trim() || null;
  }

  if (typeof payload === 'object' && payload !== null) {
    const candidate = payload as {
      message?: unknown;
      error?: unknown;
      detail?: unknown;
    };

    if (typeof candidate.message === 'string' && candidate.message.trim()) {
      return candidate.message;
    }

    if (typeof candidate.error === 'string' && candidate.error.trim()) {
      return candidate.error;
    }

    if (typeof candidate.detail === 'string' && candidate.detail.trim()) {
      return candidate.detail;
    }
  }

  return null;
}

function isAuthUser(payload: unknown): payload is AuthUser {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  const candidate = payload as {
    id?: unknown;
    name?: unknown;
    email?: unknown;
    role?: unknown;
  };

  if (typeof candidate.id !== 'number') {
    return false;
  }

  if (typeof candidate.name !== 'string' || !candidate.name.trim()) {
    return false;
  }

  if (typeof candidate.email !== 'string' || !candidate.email.trim()) {
    return false;
  }

  if (candidate.role !== undefined && typeof candidate.role !== 'string') {
    return false;
  }

  return true;
}

function parseLoginResponse(payload: unknown): { token: string; user: AuthUser | null } | null {
  if (typeof payload !== 'object' || payload === null) {
    return null;
  }

  const candidate = payload as {
    token?: unknown;
    user?: unknown;
  };

  if (typeof candidate.token !== 'string' || !candidate.token.trim()) {
    return null;
  }

  return {
    token: candidate.token,
    user: isAuthUser(candidate.user) ? candidate.user : null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Session persistence can be layered in here later (e.g. secure storage hydration).
    setIsReady(true);
  }, []);

  const signInWithCredentials = async (email: string, password: string): Promise<SignInResult> => {
    try {
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const responseBody = await response.text();

      let payload: unknown = null;
      if (responseBody) {
        try {
          payload = JSON.parse(responseBody) as unknown;
        } catch {
          payload = responseBody;
        }
      }

      if (!response.ok) {
        return {
          success: false,
          error: getServerErrorMessage(payload) ?? 'Login failed. Please check your credentials.',
        };
      }

      const parsed = parseLoginResponse(payload);
      if (!parsed) {
        return {
          success: false,
          error: 'Login response is missing a valid token. Please try again.',
        };
      }

      setToken(parsed.token);
      setUser(parsed.user);

      return { success: true };
    } catch {
      return {
        success: false,
        error: 'Unable to connect to the server. Please try again.',
      };
    }
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      isReady,
      signInWithCredentials,
      signOut,
    }),
    [token, user, isReady],
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
