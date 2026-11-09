import { Notificacion } from '../../core/domain';
import { INotificationRepository } from '../../core/ports';
import { NOTIFICACIONES_MOCK } from '../../data/mockData';

export class MockNotificationRepository implements INotificationRepository {
  private notificaciones: Notificacion[] = [...NOTIFICACIONES_MOCK];

  async registrarPushToken(token: string): Promise<void> {
    await new Promise((res) => setTimeout(res, 200));
    console.info('[MockNotificationRepository] Push token registrado:', token);
  }

  async getNotificaciones(): Promise<Notificacion[]> {
    await new Promise((res) => setTimeout(res, 200));
    return [...this.notificaciones];
  }

  async marcarComoLeidas(): Promise<void> {
    await new Promise((res) => setTimeout(res, 200));
    this.notificaciones = this.notificaciones.map((n) => ({ ...n, leida: true }));
  }
}
