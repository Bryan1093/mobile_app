import { isAxiosError } from 'axios';
import { Notificacion } from '../../core/domain';
import { INotificationRepository } from '../../core/ports';
import { apiClient } from './client';
import { handleAxiosError } from './httpErrors';

export class HttpNotificationRepository implements INotificationRepository {
  async registrarPushToken(token: string): Promise<void> {
    try {
      await apiClient.post('/notificaciones/push-token', { token });
    } catch (error) {
      if (__DEV__) {
        console.warn('[HttpNotificationRepository] Error registrando push token:', error);
      }
    }
  }

  async getNotificaciones(): Promise<Notificacion[]> {
    try {
      const response = await apiClient.get<Notificacion[]>('/notificaciones');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        if (__DEV__) {
          console.warn('[HttpNotificationRepository] Endpoint GET /notificaciones aún no disponible (404).');
        }
        return [];
      }
      return handleAxiosError(error);
    }
  }

  async marcarComoLeidas(): Promise<void> {
    try {
      await apiClient.patch('/notificaciones/marcar-leidas');
    } catch {
      try {
        await apiClient.post('/notificaciones/marcar-leidas');
      } catch (err) {
        if (__DEV__) {
          console.warn('[HttpNotificationRepository] Error marcando leídas:', err);
        }
      }
    }
  }
}
