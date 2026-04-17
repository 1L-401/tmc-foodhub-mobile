export const BASE_URL = 'https://foodhub.tmc-innovations.com/api';

/**
 * A centralized API Client designed to be used with React Query.
 * Handles automatic base URL injection and standardized error throwing.
 */
export const apiClient = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const url = `${BASE_URL}${endpoint}`;
  
  // NOTE: Insert SecureStore token retrieval here in the future
  // const token = await SecureStore.getItemAsync('userToken');

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  /*
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  */

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
