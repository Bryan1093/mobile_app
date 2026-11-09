import { Notificacion } from '../domain/entities';

export interface INotificationRepository {
  registrarPushToken(token: string): Promise<void>;
  getNotificaciones(): Promise<Notificacion[]>;
  marcarComoLeidas(): Promise<void>;
}
