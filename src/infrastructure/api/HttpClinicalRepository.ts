import { isAxiosError } from 'axios';
import { RegistroEva } from '../../core/domain';
import { IClinicalRepository } from '../../core/ports';
import { apiClient } from './client';
import { handleAxiosError } from './httpErrors';

const parseFechaMs = (fecha: string): number => {
  const parsed = Date.parse(fecha);
  if (!Number.isNaN(parsed)) return parsed;
  const dmy = fecha.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) {
    return new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1])).getTime();
  }
  return 0;
};

export class HttpClinicalRepository implements IClinicalRepository {
  async getHistorialEva(): Promise<RegistroEva[]> {
    try {
      const response = await apiClient.get<RegistroEva[]>('/me/eva');
      const data = Array.isArray(response.data) ? response.data : [];
      return [...data].sort((a, b) => parseFechaMs(b.fecha) - parseFechaMs(a.fecha));
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
}
