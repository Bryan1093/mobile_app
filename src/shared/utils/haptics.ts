import * as Haptics from 'expo-haptics';
import { Platform, Vibration } from 'react-native';

/**
 * Disparador háptico a prueba de fallos para Android e iOS.
 * En Android, ciertos métodos de Haptics (como selectionAsync) no están soportados
 * por el hardware de todos los fabricantes (Xiaomi, Samsung, Motorola), por lo que
 * se usa vibración nativa sutil o se capturan las promesas sin bloquear la UI.
 */
export async function triggerHaptic(style: 'light' | 'medium' | 'heavy' | 'selection' | 'success' = 'light') {
  if (Platform.OS === 'web') return;

  try {
    if (Platform.OS === 'android') {
      // Vibraciones sutiles nativas en milisegundos para Android (completamente estables)
      if (style === 'selection' || style === 'light') {
        Vibration.vibrate(10);
      } else if (style === 'medium') {
        Vibration.vibrate(20);
      } else if (style === 'heavy') {
        Vibration.vibrate(35);
      } else if (style === 'success') {
        Vibration.vibrate([0, 15, 60, 20]);
      }
    } else {
      // iOS soporta todos los Taptic Engine methods
      if (style === 'selection') {
        await Haptics.selectionAsync().catch(() => {});
      } else if (style === 'medium') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      } else if (style === 'heavy') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      } else if (style === 'success') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    }
  } catch {
    // Silenciar cualquier incompatibilidad de hardware nativo
  }
}

