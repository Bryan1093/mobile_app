import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../../shared/types';

/**
 * Referencia global al contenedor de navegación para Deep Linking desde notificaciones push
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate(name: any, params?: any): void {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
