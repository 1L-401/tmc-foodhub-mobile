import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const LOGIN_URL = 'https://foodhub.tmc-innovations.com/api/login';
const REGISTER_URL = 'https://foodhub.tmc-innovations.com/api/register';
const OWNER_REGISTER_URL = 'https://foodhub.tmc-innovations.com/api/owner/register';
const GOOGLE_SIGNUP_URL = 'https://foodhub.tmc-innovations.com/api/auth/google-signup';
const SEND_OTP_URL = 'https://foodhub.tmc-innovations.com/api/send-otp';
const OWNER_SEND_OTP_URL = 'https://foodhub.tmc-innovations.com/api/owner/send-otp';
const FORGOT_PASSWORD_URL = 'https://foodhub.tmc-innovations.com/api/forgot-password';
const VERIFY_RESET_OTP_URL = 'https://foodhub.tmc-innovations.com/api/verify-reset-otp';
const RESET_PASSWORD_URL = 'https://foodhub.tmc-innovations.com/api/reset-password';
const CHANGE_PASSWORD_URL = 'https://foodhub.tmc-innovations.com/api/user/password';
const USER_PROFILE_URL = 'https://foodhub.tmc-innovations.com/api/user';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  email_verified?: boolean;
  email_verified_at?: string;
  role?: string;
  address?: string;
  phone?: string;
  delivery_instructions?: string;
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

type PasswordResetRequestResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

type PasswordResetVerificationResult =
  | {
      success: true;
      message: string;
      resetToken: string;
    }
  | {
      success: false;
      error: string;
    };

type PasswordResetCompletionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

export type ChangePasswordFieldErrors = Partial<
  Record<'current_password' | 'password' | 'password_confirmation', string>
>;

type ChangePasswordResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: ChangePasswordFieldErrors;
      forceLogout?: boolean;
    };

export type UpdateUserProfilePayload = {
  first_name: string;
  last_name: string;
  phone: string | null;
  address: string | null;
  delivery_instructions: string | null;
};

export type UpdateUserProfileFieldErrors = Partial<
  Record<'first_name' | 'last_name' | 'phone' | 'address' | 'delivery_instructions', string>
>;

type UpdateUserProfileResult =
  | {
      success: true;
      message: string;
      user: AuthUser | null;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: UpdateUserProfileFieldErrors;
      forceLogout?: boolean;
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
  requestPasswordReset: (email: string) => Promise<PasswordResetRequestResult>;
  verifyPasswordResetOtp: (email: string, otp: string) => Promise<PasswordResetVerificationResult>;
  resetPasswordWithToken: (
    resetToken: string,
    password: string,
    passwordConfirmation: string,
  ) => Promise<PasswordResetCompletionResult>;
  changePassword: (
    currentPassword: string,
    password: string,
    passwordConfirmation: string,
  ) => Promise<ChangePasswordResult>;
  updateUserProfile: (payload: UpdateUserProfilePayload) => Promise<UpdateUserProfileResult>;
  signUpWithGoogleCredential: (credential: string) => Promise<AuthActionResult>;
  refreshUserProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function extractFirstErrorString(value: unknown): string | null {
  if (Array.isArray(value)) {
    const firstString = value.find((entry) => typeof entry === 'string' && entry.trim());
    return typeof firstString === 'string' ? firstString : null;
  }

  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  return null;
}

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
        const firstError = extractFirstErrorString(value);

        if (firstError) {
          return firstError;
        }
      }
    }
  }

  return null;
}

function getChangePasswordFieldErrors(payload: unknown): ChangePasswordFieldErrors | null {
  if (typeof payload !== 'object' || payload === null) {
    return null;
  }

  const rawErrors = (payload as { errors?: unknown }).errors;

  if (typeof rawErrors !== 'object' || rawErrors === null) {
    return null;
  }

  const errors = rawErrors as Record<string, unknown>;
  const fieldErrors: ChangePasswordFieldErrors = {};
  const currentPasswordError = extractFirstErrorString(errors.current_password);
  const passwordError = extractFirstErrorString(errors.password);
  const passwordConfirmationError = extractFirstErrorString(errors.password_confirmation);

  if (currentPasswordError) {
    fieldErrors.current_password = currentPasswordError;
  }

  if (passwordError) {
    fieldErrors.password = passwordError;
  }

  if (passwordConfirmationError) {
    fieldErrors.password_confirmation = passwordConfirmationError;
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
}

function getUpdateUserProfileFieldErrors(payload: unknown): UpdateUserProfileFieldErrors | null {
  if (typeof payload !== 'object' || payload === null) {
    return null;
  }

  const rawErrors = (payload as { errors?: unknown }).errors;

  if (typeof rawErrors !== 'object' || rawErrors === null) {
    return null;
  }

  const errors = rawErrors as Record<string, unknown>;
  const fieldErrors: UpdateUserProfileFieldErrors = {};
  const fieldSources: Array<[keyof UpdateUserProfileFieldErrors, string[]]> = [
    ['first_name', ['first_name', 'firstName', 'name']],
    ['last_name', ['last_name', 'lastName']],
    ['phone', ['phone']],
    ['address', ['address']],
    ['delivery_instructions', ['delivery_instructions', 'deliveryInstructions']],
  ];

  for (const [fieldKey, possibleErrorKeys] of fieldSources) {
    for (const sourceKey of possibleErrorKeys) {
      const fieldError = extractFirstErrorString(errors[sourceKey]);

      if (fieldError) {
        fieldErrors[fieldKey] = fieldError;
        break;
      }
    }
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
}

function isAuthUser(payload: unknown): payload is AuthUser {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  const candidate = payload as {
    id?: unknown;
    name?: unknown;
    email?: unknown;
    first_name?: unknown;
    last_name?: unknown;
    avatar?: unknown;
    email_verified?: unknown;
    email_verified_at?: unknown;
    role?: unknown;
    address?: unknown;
    phone?: unknown;
    delivery_instructions?: unknown;
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

  if (candidate.first_name !== undefined && typeof candidate.first_name !== 'string') {
    return false;
  }

  if (candidate.last_name !== undefined && typeof candidate.last_name !== 'string') {
    return false;
  }

  if (candidate.avatar !== undefined && typeof candidate.avatar !== 'string') {
    return false;
  }

  if (candidate.email_verified !== undefined && typeof candidate.email_verified !== 'boolean') {
    return false;
  }

  if (
    candidate.email_verified_at !== undefined
    && candidate.email_verified_at !== null
    && typeof candidate.email_verified_at !== 'string'
  ) {
    return false;
  }

  if (candidate.role !== undefined && typeof candidate.role !== 'string') {
    return false;
  }

  return true;
}

function extractOptionalString(obj: Record<string, unknown>, key: string): string | undefined {
  const val = obj[key];
  return typeof val === 'string' && val.trim() ? val : undefined;
}

function extractOptionalBoolean(obj: Record<string, unknown>, key: string): boolean | undefined {
  const val = obj[key];
  return typeof val === 'boolean' ? val : undefined;
}

function parseUserWithExtras(raw: unknown): AuthUser | null {
  if (!isAuthUser(raw)) {
    return null;
  }

  const obj = raw as Record<string, unknown>;
  const emailVerifiedAt = extractOptionalString(obj, 'email_verified_at');
  const explicitEmailVerified = extractOptionalBoolean(obj, 'email_verified');

  return {
    ...raw,
    first_name: extractOptionalString(obj, 'first_name'),
    last_name: extractOptionalString(obj, 'last_name'),
    avatar: extractOptionalString(obj, 'avatar'),
    email_verified:
      explicitEmailVerified !== undefined
        ? explicitEmailVerified
        : emailVerifiedAt
          ? true
          : undefined,
    email_verified_at: emailVerifiedAt,
    address: extractOptionalString(obj, 'address'),
    phone: extractOptionalString(obj, 'phone'),
    delivery_instructions: extractOptionalString(obj, 'delivery_instructions'),
  };
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
    user: parseUserWithExtras(candidate.user),
  };
}

function extractUserPayload(payload: unknown): unknown {
  if (typeof payload !== 'object' || payload === null) {
    return payload;
  }

  const candidate = payload as {
    user?: unknown;
    data?: unknown;
  };

  if (candidate.user !== undefined) {
    return candidate.user;
  }

  if (candidate.data !== undefined) {
    if (typeof candidate.data === 'object' && candidate.data !== null) {
      const nestedCandidate = candidate.data as { user?: unknown };

      if (nestedCandidate.user !== undefined) {
        return nestedCandidate.user;
      }
    }

    return candidate.data;
  }

  return payload;
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

function parseRetryAfterSeconds(rawValue: string | null): number | null {
  if (!rawValue) {
    return null;
  }

  const secondsValue = Number(rawValue);

  if (Number.isFinite(secondsValue) && secondsValue > 0) {
    return Math.ceil(secondsValue);
  }

  const dateValue = Date.parse(rawValue);

  if (Number.isNaN(dateValue)) {
    return null;
  }

  const deltaSeconds = Math.ceil((dateValue - Date.now()) / 1000);
  return deltaSeconds > 0 ? deltaSeconds : null;
}

function formatThrottleMessage(payload: unknown, retryAfterSeconds: number | null): string {
  const serverMessage = getServerErrorMessage(payload);

  if (serverMessage && serverMessage !== 'Too Many Attempts.') {
    return serverMessage;
  }

  if (retryAfterSeconds) {
    return `Too many attempts. Please try again in ${retryAfterSeconds} seconds.`;
  }

  return 'Too many attempts. Please try again shortly.';
}

function parseResetVerificationPayload(payload: unknown): { message: string | null; resetToken: string | null } {
  if (typeof payload !== 'object' || payload === null) {
    return {
      message: null,
      resetToken: null,
    };
  }

  const candidate = payload as {
    message?: unknown;
    reset_token?: unknown;
  };

  return {
    message: typeof candidate.message === 'string' && candidate.message.trim() ? candidate.message : null,
    resetToken:
      typeof candidate.reset_token === 'string' && candidate.reset_token.trim()
        ? candidate.reset_token
        : null,
  };
}

async function setStoredAuth(nextToken: string, nextUser: AuthUser | null) {
  if (Platform.OS === 'web') {
    localStorage.setItem('auth_token', nextToken);

    if (nextUser) {
      localStorage.setItem('auth_user', JSON.stringify(nextUser));
    } else {
      localStorage.removeItem('auth_user');
    }

    return;
  }

  await SecureStore.setItemAsync('auth_token', nextToken);

  if (nextUser) {
    await SecureStore.setItemAsync('auth_user', JSON.stringify(nextUser));
  } else {
    await SecureStore.deleteItemAsync('auth_user');
  }
}

async function clearStoredAuth() {
  if (Platform.OS === 'web') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    return;
  }

  await SecureStore.deleteItemAsync('auth_token');
  await SecureStore.deleteItemAsync('auth_user');
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
      status: response.status,
      retryAfterSeconds: parseRetryAfterSeconds(response.headers.get('Retry-After')),
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
      status: response.status,
      retryAfterSeconds: parseRetryAfterSeconds(response.headers.get('Retry-After')),
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
        if (result.status === 429) {
          return {
            success: false,
            error: formatThrottleMessage(result.payload, result.retryAfterSeconds),
          };
        }

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

  const requestPasswordReset = useCallback(async (email: string): Promise<PasswordResetRequestResult> => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      return {
        success: false,
        error: 'Please enter your email first.',
      };
    }

    try {
      const result = await postJson(FORGOT_PASSWORD_URL, { email: normalizedEmail });

      if (!result.ok) {
        if (result.status === 429) {
          return {
            success: false,
            error: formatThrottleMessage(result.payload, result.retryAfterSeconds),
          };
        }

        return {
          success: false,
          error: getServerErrorMessage(result.payload) ?? 'Unable to request a reset code right now. Please try again.',
        };
      }

      return {
        success: true,
        message:
          getServerErrorMessage(result.payload) ??
          'If an account with that email exists, a reset code has been sent.',
      };
    } catch {
      return {
        success: false,
        error: 'Unable to connect to the server. Please try again.',
      };
    }
  }, [postJson]);

  const verifyPasswordResetOtp = useCallback(async (
    email: string,
    otp: string,
  ): Promise<PasswordResetVerificationResult> => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOtp = otp.trim();

    if (!normalizedEmail) {
      return {
        success: false,
        error: 'Missing email. Please go back and request a new reset code.',
      };
    }

    if (!normalizedOtp) {
      return {
        success: false,
        error: 'Please enter your reset code.',
      };
    }

    try {
      const result = await postJson(VERIFY_RESET_OTP_URL, {
        email: normalizedEmail,
        otp: normalizedOtp,
      });

      if (!result.ok) {
        if (result.status === 429) {
          return {
            success: false,
            error: formatThrottleMessage(result.payload, result.retryAfterSeconds),
          };
        }

        return {
          success: false,
          error:
            getServerErrorMessage(result.payload) ??
            'Invalid or expired reset code. Please try again or request a new code.',
        };
      }

      const parsedPayload = parseResetVerificationPayload(result.payload);

      if (!parsedPayload.resetToken) {
        return {
          success: false,
          error: 'Unable to verify code right now. Please request a new code and try again.',
        };
      }

      return {
        success: true,
        message: parsedPayload.message ?? 'Reset code verified successfully.',
        resetToken: parsedPayload.resetToken,
      };
    } catch {
      return {
        success: false,
        error: 'Unable to connect to the server. Please try again.',
      };
    }
  }, [postJson]);

  const resetPasswordWithToken = useCallback(async (
    resetToken: string,
    password: string,
    passwordConfirmation: string,
  ): Promise<PasswordResetCompletionResult> => {
    if (!resetToken) {
      return {
        success: false,
        error: 'Invalid reset token. Please start the process again.',
      };
    }

    if (!password || !passwordConfirmation) {
      return {
        success: false,
        error: 'Please enter and confirm your new password.',
      };
    }

    try {
      const result = await postJson(RESET_PASSWORD_URL, {
        reset_token: resetToken,
        password,
        password_confirmation: passwordConfirmation,
      });

      if (!result.ok) {
        if (result.status === 429) {
          return {
            success: false,
            error: formatThrottleMessage(result.payload, result.retryAfterSeconds),
          };
        }

        return {
          success: false,
          error:
            getServerErrorMessage(result.payload) ??
            'Unable to reset password. Please verify your details and try again.',
        };
      }

      return {
        success: true,
        message:
          getServerErrorMessage(result.payload) ??
          'Password reset successfully. Please log in with your new password.',
      };
    } catch {
      return {
        success: false,
        error: 'Unable to connect to the server. Please try again.',
      };
    }
  }, [postJson]);

  const changePassword = useCallback(async (
    currentPassword: string,
    password: string,
    passwordConfirmation: string,
  ): Promise<ChangePasswordResult> => {
    if (!token) {
      return {
        success: false,
        error: 'Your session has expired. Please log in again.',
        forceLogout: true,
      };
    }

    try {
      const response = await fetch(CHANGE_PASSWORD_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const responseBody = await response.text();
      const payload = parseResponseBody(responseBody);

      if (!response.ok) {
        if (response.status === 401) {
          return {
            success: false,
            error: getServerErrorMessage(payload) ?? 'Your session has expired. Please log in again.',
            forceLogout: true,
          };
        }

        if (response.status === 422) {
          return {
            success: false,
            error: getServerErrorMessage(payload) ?? 'Please review your password details and try again.',
            fieldErrors: getChangePasswordFieldErrors(payload) ?? undefined,
          };
        }

        if (response.status === 429) {
          return {
            success: false,
            error: 'Too many attempts. Please try again later.',
          };
        }

        return {
          success: false,
          error: getServerErrorMessage(payload) ?? 'Unable to change your password right now. Please try again.',
        };
      }

      return {
        success: true,
        message: getServerErrorMessage(payload) ?? 'Password updated successfully.',
      };
    } catch {
      return {
        success: false,
        error: 'Unable to connect to the server. Please try again.',
      };
    }
  }, [token]);

  const updateUserProfile = useCallback(async (
    payload: UpdateUserProfilePayload,
  ): Promise<UpdateUserProfileResult> => {
    if (!token) {
      return {
        success: false,
        error: 'Your session has expired. Please log in again.',
        forceLogout: true,
      };
    }

    try {
      const response = await fetch(USER_PROFILE_URL, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseBody = await response.text();
      const responsePayload = parseResponseBody(responseBody);

      if (!response.ok) {
        if (response.status === 401) {
          return {
            success: false,
            error: getServerErrorMessage(responsePayload) ?? 'Your session has expired. Please log in again.',
            forceLogout: true,
          };
        }

        if (response.status === 422) {
          return {
            success: false,
            error:
              getServerErrorMessage(responsePayload)
              ?? 'Please review your profile details and try again.',
            fieldErrors: getUpdateUserProfileFieldErrors(responsePayload) ?? undefined,
          };
        }

        return {
          success: false,
          error:
            getServerErrorMessage(responsePayload)
            ?? 'Unable to update your profile right now. Please try again.',
        };
      }

      const userFromResponse = parseUserWithExtras(extractUserPayload(responsePayload));

      const fallbackUser = user
        ? {
            ...user,
            first_name: payload.first_name,
            last_name: payload.last_name,
            name: `${payload.first_name} ${payload.last_name}`.trim(),
            phone: payload.phone ?? undefined,
            address: payload.address ?? undefined,
            delivery_instructions: payload.delivery_instructions ?? undefined,
          }
        : null;

      const nextUser = userFromResponse ?? fallbackUser;

      if (nextUser) {
        setUser(nextUser);
        await setStoredAuth(token, nextUser);
      }

      return {
        success: true,
        message: getServerErrorMessage(responsePayload) ?? 'Profile updated successfully.',
        user: nextUser,
      };
    } catch {
      return {
        success: false,
        error: 'Unable to connect to the server. Please try again.',
      };
    }
  }, [token, user]);

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

  const refreshUserProfile = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const response = await fetch(USER_PROFILE_URL, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return;
      }

      const payload = await response.json();
      const freshUser = parseUserWithExtras(extractUserPayload(payload));

      if (freshUser) {
        setUser(freshUser);
        await setStoredAuth(token, freshUser);
      }
    } catch {
      // Silently ignore — profile refresh is best-effort
    }
  }, [token]);

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
      requestPasswordReset,
      verifyPasswordResetOtp,
      resetPasswordWithToken,
      changePassword,
      updateUserProfile,
      signUpWithGoogleCredential,
      refreshUserProfile,
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
      requestPasswordReset,
      verifyPasswordResetOtp,
      resetPasswordWithToken,
      changePassword,
      updateUserProfile,
      signUpWithGoogleCredential,
      refreshUserProfile,
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
