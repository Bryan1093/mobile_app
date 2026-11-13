import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Canal oficial de notificaciones para Android (Innova Fisioterapia)
 */
export const NOTIFICATION_CHANNEL_ID = 'innova_citas_channel';

/**
 * Configuración global del handler de notificaciones para primer plano (Foreground).
 * Cumple con las especificaciones de Expo SDK 58 (shouldShowBanner / shouldShowList).
 */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Solicita permisos de notificación y obtiene el ExpoPushToken del dispositivo.
 * Maneja amigablemente entornos de emulador y dispositivos físicos.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  // Configuración de canal en Android 8.0+ (Oreo y superior)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
      name: 'Recordatorios de Citas Médicas',
      description: 'Notificaciones sobre turnos y tratamientos de Innova Fisioterapia',
      importance: AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1B6B53',
      sound: 'default',
    });
  }

  // Manejo amigable para emuladores
  if (!Device.isDevice) {
    console.info(
      '[NotificationsService] Ejecutando en Simulador/Emulador. Las notificaciones push APNs/FCM requieren un dispositivo físico. Utilizando token de depuración controlado.'
    );
    return 'ExponentPushToken[SIMULADOR_DEBUG_INNOVA]';
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[NotificationsService] Permiso denegado por el usuario para notificaciones push.');
      return null;
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync().catch((err) => {
      console.warn('[NotificationsService] Advertencia al resolver ExpoPushToken:', err?.message || err);
      return null;
    });

    return tokenResponse?.data ?? null;
  } catch (error) {
    console.warn('[NotificationsService] Error general registrando notificaciones:', error);
    return null;
  }
}

/**
 * Dispara una notificación local inmediata (útil para pruebas y simulación in-app del botón administrativo)
 */
export async function presentLocalNotification(
  titulo: string,
  mensaje: string,
  data: Record<string, unknown> = {}
): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: titulo,
      body: mensaje,
      data,
      sound: 'default',
    },
    trigger: null, // Inmediata
  });
}
