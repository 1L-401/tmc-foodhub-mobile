import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const BASE_URL = 'https://foodhub.tmc-innovations.com/api';

/**
 * Retrieve the stored auth token from SecureStore (native) or localStorage (web).
 */
async function getStoredToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem('auth_token');
    }
    return await SecureStore.getItemAsync('auth_token');
  } catch {
    return null;
  }
}

/**
 * A centralized API Client designed to be used with React Query.
 * Handles automatic base URL injection, auth token injection, and standardized error throwing.
 */
export const apiClient = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const url = `${BASE_URL}${endpoint}`;

  const token = await getStoredToken();
  const isFormDataBody = typeof FormData !== 'undefined' && options?.body instanceof FormData;

  const defaultHeaders: Record<string, string> = {
    'Accept': 'application/json',
  };

  if (!isFormDataBody) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options?.headers as Record<string, string>),
    },
  });

  if (!response.ok) {
    // Attempt to parse any server-provided error message
    let errorMessage = response.statusText;
    try {
      const errorData = await response.json();
      if (errorData?.message) errorMessage = errorData.message;
      if (errorData?.error) errorMessage = errorData.error;
    } catch (e) {
      // Ignored
    }
    throw new Error(`Error ${response.status}: ${errorMessage}`);
  }

  // Some endpoints might return empty successful responses (like 204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};
