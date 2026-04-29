import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL, buildApiUrl } from '@/src/api/apiConfig';

export const BASE_URL = API_BASE_URL;

const OWNER_AUTH_TOKEN_STORAGE_KEY = 'owner.auth.token';

const getStoredToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(OWNER_AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

/**
 * A centralized API Client designed to be used with React Query.
 * Handles automatic base URL injection and standardized error throwing.
 */
export const apiClient = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const url = buildApiUrl(endpoint);
  const token = await getStoredToken();

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

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
    } catch {
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
