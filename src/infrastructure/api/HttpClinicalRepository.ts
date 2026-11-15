import { isAxiosError } from 'axios';
import { RegistroEva } from '../../core/domain';
import { IClinicalRepository } from '../../core/ports';
import { apiClient } from './client';
import { handleAxiosError } from './httpErrors';

export class HttpClinicalRepository implements IClinicalRepository {
  async getHistorialEva(): Promise<RegistroEva[]> {
    try {
      const response = await apiClient.get<RegistroEva[]>('/me/eva');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        if (__DEV__) {
          console.warn('[HttpClinicalRepository] Endpoint GET /me/eva aún no disponible (404).');
        }
        return [];
      }
      return handleAxiosError(error);
    }
  }

  async agregarRegistroEva(registro: Omit<RegistroEva, 'id'>): Promise<RegistroEva> {
    try {
      const response = await apiClient.post<RegistroEva>('/me/eva', registro);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        if (__DEV__) {
          console.warn('[HttpClinicalRepository] Endpoint POST /me/eva aún no disponible (404).');
        }
        return {
          id: `eva-local-${Date.now()}`,
          ...registro,
        };
      }
      return handleAxiosError(error);
    }
  }
}
