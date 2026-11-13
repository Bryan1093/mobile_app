import { apiClient, removeAuthToken, saveAuthToken } from './client';
import { RegistroPacienteDTO, UsuarioPaciente } from '../../core/domain';
import { IAuthRepository } from '../../core/ports';
import { handleAxiosError } from './httpErrors';

export class HttpAuthRepository implements IAuthRepository {
  async login(identificador: string, contrasena: string): Promise<UsuarioPaciente> {
    try {
      const response = await apiClient.post('/auth/login', {
        identificador,
        contrasena,
      });

      const data = response.data;
      const token = data.token || data.accessToken || data.jwt;
      if (token) {
        await saveAuthToken(token);
      }

      return data.usuario || data.user || data;
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  async register(datos: RegistroPacienteDTO): Promise<UsuarioPaciente> {
    try {
      const response = await apiClient.post('/auth/register', datos);
      const data = response.data;
      const token = data.token || data.accessToken || data.jwt;
      if (token) {
        await saveAuthToken(token);
      }

      return data.usuario || data.user || data;
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout').catch(() => {
        // Ignorar si el backend ya cerró la sesión
      });
    } finally {
      await removeAuthToken();
    }
  }

  async getMe(): Promise<UsuarioPaciente | null> {
    try {
      const response = await apiClient.get('/auth/me');
      const data = response.data;
      return data.usuario || data.user || data;
    } catch {
      try {
        // Fallback a endpoint alterno si backend usa /pacientes/me
        const fallback = await apiClient.get('/pacientes/me');
        return fallback.data.usuario || fallback.data;
      } catch {
        return null;
      }
    }
  }
}
