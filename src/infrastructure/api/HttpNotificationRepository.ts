import { apiClient } from '../../api/client';
import { Notificacion } from '../../core/domain';
import { INotificationRepository } from '../../core/ports';
import { handleAxiosError } from './httpErrors';

export class HttpNotificationRepository implements INotificationRepository {
  async registrarPushToken(token: string): Promise<void> {
    try {
      await apiClient.post('/notificaciones/push-token', { token });
    } catch (error) {
      // Registrar push token no debe bloquear la app si falla
      console.warn('[HttpNotificationRepository] Error registrando push token:', error);
    }
  }

  async getNotificaciones(): Promise<Notificacion[]> {
    try {
      const response = await apiClient.get('/notificaciones');
      return response.data?.data || response.data;
    } catch (error) {
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
        console.warn('[HttpNotificationRepository] Error marcando leídas:', err);
      }
    }
  }
}
