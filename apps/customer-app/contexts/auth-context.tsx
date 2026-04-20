import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = Platform.OS === 'web' 
  ? 'https://foodhub.tmc-innovations.com/api' 
  : 'https://foodhub.tmc-innovations.com/api';

const LOGIN_URL = `${API_BASE_URL}/login`;
const REGISTER_URL = `${API_BASE_URL}/register`;
const OWNER_REGISTER_URL = `${API_BASE_URL}/owner/register`;
const GOOGLE_SIGNUP_URL = `${API_BASE_URL}/auth/google-signup`;
const SEND_OTP_URL = `${API_BASE_URL}/send-otp`;
const OWNER_SEND_OTP_URL = `${API_BASE_URL}/owner/send-otp`;

const setStoredAuth = async (token: string, user: AuthUser | null) => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem('auth_token', token);
      if (user) {
        localStorage.setItem('auth_user', JSON.stringify(user));
      }
    } else {
      await SecureStore.setItemAsync('auth_token', token);
      if (user) {
        await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
      }
    }
  } catch (e) {
    console.error('Failed to store auth data', e);
  }
};

const clearStoredAuth = async () => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    } else {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('auth_user');
    }
  } catch (e) {
    console.error('Failed to clear auth data', e);
  }
};

type AuthUser = {
  id: number;
  name: string;
  email: string;
  role?: string;
};

type AuthActionResult =
  | {
      success: true;
      authenticated: boolean;
    }
  | {
      success: false;
      error: string;
    };

type OtpActionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

export type CustomerSignupPayload = {
  email_verification_token: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  terms_accepted: boolean;
  privacy_accepted: boolean;
  address: string;
  phone: string;
  delivery_instructions: string;
};

export type OwnerSignupPayload = {
  email_verification_token: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  restaurant_name: string;
  business_address: string;
  business_contact_number: string;
  business_permit: string;
  terms_accepted: boolean;
  privacy_accepted: boolean;
  merchant_agreement_accepted: boolean;
  phone: string;
  address: string;
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isReady: boolean;
  signInWithCredentials: (email: string, password: string) => Promise<AuthActionResult>;
  signUpCustomer: (payload: CustomerSignupPayload) => Promise<AuthActionResult>;
  signUpOwner: (payload: OwnerSignupPayload) => Promise<AuthActionResult>;
  sendSignupOtp: (email: string, userType: 'customer' | 'partner') => Promise<OtpActionResult>;
  signUpWithGoogleCredential: (credential: string) => Promise<AuthActionResult>;
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
      errors?: unknown;
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

    if (candidate.errors && typeof candidate.errors === 'object') {
      const values = Object.values(candidate.errors as Record<string, unknown>);

      for (const value of values) {
        if (Array.isArray(value)) {
          const firstString = value.find((entry) => typeof entry === 'string' && entry.trim());

          if (typeof firstString === 'string') {
            return firstString;
          }

          continue;
        }

        if (typeof value === 'string' && value.trim()) {
          return value;
        }
      }
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

function parseAuthResponse(payload: unknown): { token: string; user: AuthUser | null } | null {
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

function parseResponseBody(responseBody: string): unknown {
  if (!responseBody) {
    return null;
  }

  try {
    return JSON.parse(responseBody) as unknown;
  } catch {
    return responseBody;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadStoredAuth() {
      try {
        let storedToken = null;
        let storedUser = null;

        if (Platform.OS === 'web') {
          storedToken = localStorage.getItem('auth_token');
          const userStr = localStorage.getItem('auth_user');
          if (userStr) {
            try {
               storedUser = JSON.parse(userStr);
            } catch (e) {}
          }
        } else {
          storedToken = await SecureStore.getItemAsync('auth_token');
          const userStr = await SecureStore.getItemAsync('auth_user');
          if (userStr) {
             try {
               storedUser = JSON.parse(userStr);
             } catch (e) {}
          }
        }

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            setUser(storedUser);
          }
        }
      } catch (e) {
        console.error('Failed to load auth data', e);
      } finally {
        setIsReady(true);
      }
    }

    loadStoredAuth();
  }, []);

  const postJson = useCallback(async (url: string, body: Record<string, unknown>) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const responseBody = await response.text();

    return {
      ok: response.ok,
      payload: parseResponseBody(responseBody),
    };
  }, []);

  const postForm = useCallback(async (url: string, body: Record<string, string>) => {
    const encodedBody = Object.entries(body)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: encodedBody,
    });

    const responseBody = await response.text();

    return {
      ok: response.ok,
      payload: parseResponseBody(responseBody),
    };
  }, []);

  const applyAuthPayload = useCallback(async (payload: unknown) => {
    const parsed = parseAuthResponse(payload);

    if (!parsed) {
      return false;
    }

    setToken(parsed.token);
    setUser(parsed.user);
    await setStoredAuth(parsed.token, parsed.user);
    return true;
  }, []);

  const signInWithCredentials = useCallback(async (email: string, password: string): Promise<AuthActionResult> => {
    try {
      const result = await postJson(LOGIN_URL, { email, password });

      if (!result.ok) {
        return {
          success: false,
          error: getServerErrorMessage(result.payload) ?? 'Login failed. Please check your credentials.',
        };
      }

      const applied = await applyAuthPayload(result.payload);
      if (!applied) {
        return {
          success: false,
          error: 'Login response is missing a valid token. Please try again.',
        };
      }

      return {
        success: true,
        authenticated: true,
      };
    } catch {
      return {
        success: false,
        error: 'Unable to connect to the server. Please try again.',
      };
    }
  }, [applyAuthPayload, postJson]);

  const signUpCustomer = useCallback(async (payload: CustomerSignupPayload): Promise<AuthActionResult> => {
    try {
      const result = await postJson(REGISTER_URL, payload as Record<string, unknown>);

      if (!result.ok) {
        return {
          success: false,
          error: getServerErrorMessage(result.payload) ?? 'Unable to create your account.',
        };
      }

      const applied = await applyAuthPayload(result.payload);
      return {
        success: true,
        authenticated: applied,
      };
    } catch {
      return {
        success: false,
        error: 'Unable to connect to the server. Please try again.',
      };
    }
  }, [applyAuthPayload, postJson]);

  const signUpOwner = useCallback(async (payload: OwnerSignupPayload): Promise<AuthActionResult> => {
    try {
      const result = await postJson(OWNER_REGISTER_URL, payload as Record<string, unknown>);

      if (!result.ok) {
        return {
          success: false,
          error: getServerErrorMessage(result.payload) ?? 'Unable to create your owner account.',
        };
      }

      const applied = await applyAuthPayload(result.payload);
      return {
        success: true,
        authenticated: applied,
      };
    } catch {
      return {
        success: false,
        error: 'Unable to connect to the server. Please try again.',
      };
    }
  }, [applyAuthPayload, postJson]);

  const sendSignupOtp = useCallback(async (
    email: string,
    userType: 'customer' | 'partner',
  ): Promise<OtpActionResult> => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      return {
        success: false,
        error: 'Please enter your email first.',
      };
    }

    const endpoint = userType === 'partner' ? OWNER_SEND_OTP_URL : SEND_OTP_URL;

    try {
      const result = await postForm(endpoint, { email: normalizedEmail });

      if (!result.ok) {
        return {
          success: false,
          error: getServerErrorMessage(result.payload) ?? 'Unable to send OTP right now. Please try again.',
        };
      }

      return {
        success: true,
        message: getServerErrorMessage(result.payload) ?? 'Verification code sent to your email.',
      };
    } catch {
      return {
        success: false,
        error: 'Unable to connect to the server. Please try again.',
      };
    }
  }, [postForm]);

  const signUpWithGoogleCredential = useCallback(async (credential: string): Promise<AuthActionResult> => {
    try {
      const result = await postJson(GOOGLE_SIGNUP_URL, { credential });

      if (!result.ok) {
        return {
          success: false,
          error: getServerErrorMessage(result.payload) ?? 'Google signup failed. Please try again.',
        };
      }

      const applied = await applyAuthPayload(result.payload);
      return {
        success: true,
        authenticated: applied,
      };
    } catch {
      return {
        success: false,
        error: 'Unable to connect to the server. Please try again.',
      };
    }
  }, [applyAuthPayload, postJson]);

  const signOut = useCallback(async () => {
    setToken(null);
    setUser(null);
    await clearStoredAuth();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      isReady,
      signInWithCredentials,
      signUpCustomer,
      signUpOwner,
      sendSignupOtp,
      signUpWithGoogleCredential,
      signOut,
    }),
    [
      token,
      user,
      isReady,
      signInWithCredentials,
      signUpCustomer,
      signUpOwner,
      sendSignupOtp,
      signUpWithGoogleCredential,
      signOut,
    ],
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
