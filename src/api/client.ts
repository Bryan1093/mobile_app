import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const JWT_KEY = 'INNOVA_AUTH_TOKEN_JWT';

// URL del backend Node.js (se puede configurar mediante variable de entorno o IP local para pruebas en red)
export const API_BASE_URL = 'http://192.168.100.10:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptor para inyectar token JWT almacenado de forma segura (LOPDP)
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      let token: string | null = null;
      if (Platform.OS !== 'web') {
        token = await SecureStore.getItemAsync(JWT_KEY);
      } else {
        token = localStorage.getItem(JWT_KEY);
      }

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Error al recuperar token JWT de SecureStore:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Manejo centralizado de tokens
export async function saveAuthToken(token: string): Promise<void> {
  if (Platform.OS !== 'web') {
    await SecureStore.setItemAsync(JWT_KEY, token);
  } else {
    localStorage.setItem(JWT_KEY, token);
  }
}

export async function removeAuthToken(): Promise<void> {
  if (Platform.OS !== 'web') {
    await SecureStore.deleteItemAsync(JWT_KEY);
  } else {
    localStorage.removeItem(JWT_KEY);
  }
}

export async function getAuthToken(): Promise<string | null> {
  if (Platform.OS !== 'web') {
    return await SecureStore.getItemAsync(JWT_KEY);
  } else {
    return localStorage.getItem(JWT_KEY);
  }
}

export function isConflictError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 409;
  }
  return false;
}

