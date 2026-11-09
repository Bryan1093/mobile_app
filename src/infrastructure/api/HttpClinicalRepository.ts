import { apiClient } from '../../api/client';
import { RegistroEva } from '../../core/domain';
import { IClinicalRepository } from '../../core/ports';
import { handleAxiosError } from './httpErrors';

export class HttpClinicalRepository implements IClinicalRepository {
  async getHistorialEva(): Promise<RegistroEva[]> {
    try {
      const response = await apiClient.get('/pacientes/me/eva');
      return response.data?.data || response.data;
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  async agregarRegistroEva(registro: Omit<RegistroEva, 'id'>): Promise<RegistroEva> {
    try {
      const response = await apiClient.post('/pacientes/me/eva', registro);
      return response.data?.data || response.data;
    } catch (error) {
      return handleAxiosError(error);
    }
  }
}
