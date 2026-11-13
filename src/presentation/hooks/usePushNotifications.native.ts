import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { useAppointments } from '../context/AppointmentContext';
import { useAuth } from '../context/AuthContext';
import { Notificacion } from '../../core/domain';
import { notificationRepository } from '../../infrastructure/container';
import { navigate } from '../navigation/navigationRef';
import {
  configureNotificationHandler,
  registerForPushNotificationsAsync,
} from '../../infrastructure/notifications/notifications';

// Inicializar el manejador de notificaciones una sola vez al cargar el módulo
configureNotificationHandler();

export interface UsePushNotificationsResult {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
}

/**
 * Hook personalizado para orquestar el ciclo de vida de Notificaciones Push en plataformas nativas:
 * 1. Solicita permisos y registra el token push en el backend vía Clean Architecture.
 * 2. Recibe notificaciones en primer plano y las agrega a la bandeja in-app (NotificationsModal).
 * 3. Gestiona el deep-linking cuando el paciente presiona un banner push (abre la cita médica).
 */
export function usePushNotifications(): UsePushNotificationsResult {
  const { usuario } = useAuth();
  const { agregarNotificacionInApp, recargarDatos } = useAppointments();

  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // Registro del token push cuando el usuario está disponible
  useEffect(() => {
    let isMounted = true;

    async function initPushToken() {
      const token = await registerForPushNotificationsAsync();
      if (!isMounted || !token) return;

      setExpoPushToken(token);

      // Si el paciente está autenticado, sincronizar token con la base de datos
      try {
        await notificationRepository.registrarPushToken(token);
        console.info('[usePushNotifications] Token push sincronizado con backend:', token);
      } catch (err) {
        console.warn('[usePushNotifications] Error al enviar token al backend:', err);
      }
    }

    initPushToken();

    return () => {
      isMounted = false;
    };
  }, [usuario]);

  // Listeners de recepción y respuesta a notificaciones
  useEffect(() => {
    // 1. Notificación recibida en Foreground (primer plano)
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (incomingNotification) => {
        setNotification(incomingNotification);

        const content = incomingNotification.request.content;
        const payloadData = (content.data || {}) as Record<string, any>;

        // Mapeo al dominio Notificacion in-app
        const nuevaNotificacion: Notificacion = {
          id: payloadData.id ? String(payloadData.id) : `notif-${Date.now()}`,
          titulo: content.title || 'Recordatorio de Cita',
          mensaje: content.body || '',
          fecha: 'Justo ahora',
          leida: false,
          tipo: payloadData.tipo || 'RECORDATORIO_CITA',
          citaId: payloadData.citaId ? String(payloadData.citaId) : undefined,
        };

        agregarNotificacionInApp(nuevaNotificacion);
      }
    );

    // 2. Notificación presionada por el usuario (Interacción / Deep-link)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const content = response.notification.request.content;
        const payloadData = (content.data || {}) as Record<string, any>;

        // Añadir a bandeja in-app si aún no está presente
        const notifTapped: Notificacion = {
          id: payloadData.id ? String(payloadData.id) : `notif-tapped-${Date.now()}`,
          titulo: content.title || 'Recordatorio de Cita',
          mensaje: content.body || '',
          fecha: 'Justo ahora',
          leida: true,
          tipo: payloadData.tipo || 'RECORDATORIO_CITA',
          citaId: payloadData.citaId ? String(payloadData.citaId) : undefined,
        };

        agregarNotificacionInApp(notifTapped);

        // Recargar datos para reflejar posibles cambios de estado en backend
        recargarDatos().catch(() => {});

        // Deep-link: Navegar a la pantalla correspondiente
        if (payloadData.tipo === 'NUEVO_DOCUMENTO') {
          navigate('Main', { screen: 'TratamientosTab' });
        } else {
          // Por defecto a Mis Citas (ej. recordatorio de cita)
          navigate('Main', { screen: 'CitasTab' });
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [agregarNotificacionInApp, recargarDatos]);

  return {
    expoPushToken,
    notification,
  };
}
