import axios, { AxiosError, InternalAxiosRequestConfig, isAxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'innova_access_token';
const REFRESH_TOKEN_KEY = 'innova_refresh_token';

// URL del backend Node.js (se puede configurar mediante variable de entorno o IP local para pruebas en red)
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.10:3000/api';

// eslint-disable-next-line import/no-named-as-default-member
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

async function getStoredItem(key: string): Promise<string | null> {
  if (Platform.OS !== 'web') {
    return await SecureStore.getItemAsync(key);
  }
  return localStorage.getItem(key);
}

async function setStoredItem(key: string, value: string): Promise<void> {
  if (Platform.OS !== 'web') {
    await SecureStore.setItemAsync(key, value);
  } else {
    localStorage.setItem(key, value);
  }
}

async function deleteStoredItem(key: string): Promise<void> {
  if (Platform.OS !== 'web') {
    await SecureStore.deleteItemAsync(key);
  } else {
    localStorage.removeItem(key);
  }
}

// Manejo centralizado de tokens
export async function saveAuthToken(token: string): Promise<void> {
  await setStoredItem(ACCESS_TOKEN_KEY, token);
}

export async function saveRefreshToken(token: string): Promise<void> {
  await setStoredItem(REFRESH_TOKEN_KEY, token);
}

export async function saveTokens(accessToken: string, refreshToken?: string): Promise<void> {
  await saveAuthToken(accessToken);
  if (refreshToken) {
    await saveRefreshToken(refreshToken);
  }
}

export async function getAuthToken(): Promise<string | null> {
  return await getStoredItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return await getStoredItem(REFRESH_TOKEN_KEY);
}

export async function removeAuthToken(): Promise<void> {
  await Promise.all([
    deleteStoredItem(ACCESS_TOKEN_KEY),
    deleteStoredItem(REFRESH_TOKEN_KEY),
  ]);
}

// Interceptor para inyectar accessToken almacenado de forma segura (LOPDP)
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getAuthToken();
      if (token && config.headers && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Error al recuperar accessToken de SecureStore:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Lock compartido para evitar múltiples POST /auth/refresh simultáneos
let refreshPromise: Promise<string | null> | null = null;

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

async function executeTokenRefresh(): Promise<string | null> {
  const rt = await getRefreshToken();
  if (!rt) {
    return null;
  }

  try {
    const response = await axios.post<{
      accessToken?: string;
      refreshToken?: string;
    }>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken: rt },
      {
        timeout: 12000,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    const newAccessToken = response.data?.accessToken;
    const newRefreshToken = response.data?.refreshToken;

    if (!newAccessToken) {
      await removeAuthToken();
      return null;
    }

    await saveTokens(newAccessToken, newRefreshToken);
    return newAccessToken;
  } catch {
    await removeAuthToken();
    return null;
  }
}

// Interceptor de respuesta 401 con refresh automático y lock de concurrencia
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url ?? '';

    const isAuthLifecycleEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/logout');

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthLifecycleEndpoint) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = executeTokenRefresh().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;
      if (newAccessToken) {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export function isConflictError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return error.response?.status === 409;
  }
  return false;
}
