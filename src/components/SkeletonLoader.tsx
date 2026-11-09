import React, { useEffect, useState } from 'react';
import {
  Animated,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { THEME } from '../constants/theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Componente base de animación Skeleton pulsante a 60 FPS usando useNativeDriver: true
 * Oscila suavemente entre opacidad 0.35 y 0.75 en bucle infinito.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 6,
  style,
}) => {
  const [opacityAnim] = useState(() => new Animated.Value(0.35));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.75,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.35,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.skeletonBase,
        {
          width: width as any,
          height,
          borderRadius,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
};

/**
 * Placeholder Skeleton para la tarjeta de citas (CitaCard).
 * Evita pantallazos blancos al cargar el listado de citas programadas o historial.
 */
export const CitaCardSkeleton: React.FC = () => {
  return (
    <View style={styles.citaCardSkeleton}>
      {/* Cabecera: Especialidad y Badge de Estado */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitles}>
          <Skeleton width="70%" height={18} borderRadius={6} />
          <Skeleton width="45%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
        </View>
        <Skeleton width={80} height={24} borderRadius={12} />
      </View>

      <View style={styles.divider} />

      {/* Filas de Información Médica (Fecha, Fisioterapeuta, Paciente) */}
      <View style={styles.detailsContainer}>
        <View style={styles.infoRow}>
          <Skeleton width={18} height={18} borderRadius={9} />
          <Skeleton width="60%" height={14} borderRadius={4} />
        </View>
        <View style={styles.infoRow}>
          <Skeleton width={18} height={18} borderRadius={9} />
          <Skeleton width="50%" height={14} borderRadius={4} />
        </View>
        <View style={styles.infoRow}>
          <Skeleton width={18} height={18} borderRadius={9} />
          <Skeleton width="55%" height={14} borderRadius={4} />
        </View>
      </View>

      {/* Botones de Acción Inferiores */}
      <View style={styles.actionsRow}>
        <Skeleton width={110} height={34} borderRadius={8} />
        <Skeleton width={90} height={34} borderRadius={8} />
      </View>
    </View>
  );
};

/**
 * Placeholder Skeleton para los bloques o turnos de horarios disponibles (BloqueHorario).
 * Evita el parpadeo blanco al consultar horarios por fecha o en el modal de turnos.
 */
export const BloqueHorarioSkeleton: React.FC = () => {
  return (
    <View style={styles.bloqueHorarioSkeleton}>
      <View style={styles.bloqueTopRow}>
        <Skeleton width={18} height={18} borderRadius={9} />
        <Skeleton width={50} height={18} borderRadius={9} />
      </View>
      <Skeleton width="85%" height={16} borderRadius={5} style={{ marginTop: 8 }} />
      <Skeleton width="50%" height={11} borderRadius={4} style={{ marginTop: 6 }} />
    </View>
  );
};

/**
 * Placeholder Skeleton para la tarjeta del especialista en SeleccionHorarioScreen.
 */
export const FisioterapeutaCardSkeleton: React.FC = () => {
  return (
    <View style={styles.fisioCardSkeleton}>
      <View style={styles.fisioHeader}>
        <Skeleton width={54} height={54} borderRadius={27} />
        <View style={styles.fisioInfo}>
          <Skeleton width="65%" height={16} borderRadius={5} />
          <Skeleton width="40%" height={12} borderRadius={4} style={{ marginTop: 5 }} />
          <Skeleton width="55%" height={12} borderRadius={4} style={{ marginTop: 5 }} />
        </View>
      </View>

      <Skeleton width="40%" height={12} borderRadius={4} style={{ marginTop: 14 }} />

      <View style={styles.fisioActionsRow}>
        <Skeleton width="55%" height={40} borderRadius={8} />
        <Skeleton width="40%" height={40} borderRadius={8} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: '#CBD5E1',
  },
  citaCardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.borderRadius.md,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...THEME.shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitles: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  detailsContainer: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  bloqueHorarioSkeleton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    margin: 4,
    minHeight: 88,
  },
  bloqueTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fisioCardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 12,
    ...THEME.shadows.card,
  },
  fisioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fisioInfo: {
    flex: 1,
  },
  fisioActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
});
