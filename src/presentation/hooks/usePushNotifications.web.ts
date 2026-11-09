export interface UsePushNotificationsResult {
  expoPushToken: string | null;
  notification: null;
}

/**
 * Hook no-op para Web:
 * Las notificaciones push móviles nativas (APNs/FCM) no aplican en el entorno Web.
 * Retorna valores seguros para evitar errores en navegadores de escritorio o móviles.
 */
export function usePushNotifications(): UsePushNotificationsResult {
  return {
    expoPushToken: null,
    notification: null,
  };
}
