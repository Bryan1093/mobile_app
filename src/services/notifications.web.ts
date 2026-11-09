/**
 * Canal oficial de notificaciones para Android (Innova Fisioterapia) - Stub para Web
 */
export const NOTIFICATION_CHANNEL_ID = 'innova_citas_channel';

/**
 * Configuración global del handler de notificaciones para primer plano.
 * No-op en Web para evitar cargar módulos no soportados de expo-notifications.
 */
export function configureNotificationHandler(): void {
  // No-op en Web
}

/**
 * Solicita permisos de notificación y obtiene el ExpoPushToken del dispositivo.
 * En Web retorna null de forma segura.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  return null;
}

/**
 * Dispara una notificación local inmediata.
 * No-op en Web.
 */
export async function presentLocalNotification(
  _titulo: string,
  _mensaje: string,
  _data: Record<string, unknown> = {}
): Promise<string> {
  return '';
}
