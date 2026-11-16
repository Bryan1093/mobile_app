import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { THEME } from '../../theme/theme';
import { RegistroEVA } from '../../../shared/types';

interface EvaScaleCardProps {
  registros: RegistroEVA[];
}

const parseFechaMs = (fecha: string): number => {
  const parsed = Date.parse(fecha);
  if (!Number.isNaN(parsed)) return parsed;
  const dmy = fecha.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) {
    return new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1])).getTime();
  }
  return 0;
};

const formatearFechaEva = (fecha: string): string => {
  if (!fecha) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha.trim())) {
    return fecha.trim();
  }
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) {
    return fecha;
  }
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const anio = date.getFullYear();
  return `${dia}/${mes}/${anio}`;
};

export const EvaScaleCard: React.FC<EvaScaleCardProps> = ({ registros }) => {
  const registrosOrdenados = useMemo(
    () => [...registros].sort((a, b) => parseFechaMs(b.fecha) - parseFechaMs(a.fecha)),
    [registros]
  );

  const ultimoRegistro = registrosOrdenados[0];
  const nivelActual = ultimoRegistro?.nivelDolor ?? 0;

  // Animación de nivel e interpolación de color con inicialización React 19
  const [animatedLevel] = useState(() => new Animated.Value(nivelActual));

  useEffect(() => {
    Animated.timing(animatedLevel, {
      toValue: nivelActual,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [nivelActual, animatedLevel]);

  // Interpolación de color suave: verde esmeralda -> verde claro -> ámbar -> naranja -> rojo clínico
  const animatedBgColor = animatedLevel.interpolate({
    inputRange: [0, 2, 4, 6, 8, 10],
    outputRange: [
      '#10B981', // 0-2: Verde (leve / sin dolor)
      '#10B981',
      '#84CC16', // 4: Verde claro / molestia leve
      '#F59E0B', // 6: Amarillo / dolor moderado
      '#F97316', // 8: Naranja / dolor severo
      '#EF4444', // 10: Rojo / dolor muy severo / insoportable
    ],
  });

  // Interpolación de posición para la barra analógica continua (0% a 92%)
  const animatedThumbPosition = animatedLevel.interpolate({
    inputRange: [0, 10],
    outputRange: ['0%', '92%'],
  });

  const getColorPorNivel = (nivel: number) => {
    if (nivel <= 2) return '#10B981';
    if (nivel <= 4) return '#84CC16';
    if (nivel <= 6) return '#F59E0B';
    if (nivel <= 8) return '#F97316';
    return '#EF4444';
  };

  const getTextoDolor = (nivel: number) => {
    if (nivel === 0) return 'Sin dolor (0/10)';
    if (nivel <= 3) return 'Dolor leve / Molestia';
    if (nivel <= 6) return 'Dolor moderado';
    if (nivel <= 8) return 'Dolor severo';
    return 'Dolor incapacitante';
  };

  return (
    <View style={styles.card}>
      {/* Cabecera del Componente */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MaterialIcons name="healing" size={20} color={THEME.colors.primary} />
        </View>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Evolución del Dolor (Escala EVA)</Text>
          <Text style={styles.subtitle}>
            Escala Visual Análoga clínica (0 = Sin dolor, 10 = Máximo dolor)
          </Text>
        </View>
      </View>

      <View style={styles.readOnlyBadge}>
        <MaterialIcons name="lock-outline" size={12} color={THEME.colors.textSecondary} />
        <Text style={styles.readOnlyBadgeText}>
          Solo lectura · Registrado en consulta clínica
        </Text>
      </View>

      {/* Indicador numérico con interpolación de color clínico */}
      <View style={styles.scoreRow}>
        <Animated.View
          style={[
            styles.scoreBadge,
            {
              backgroundColor: ultimoRegistro ? animatedBgColor : THEME.colors.textMuted,
            },
          ]}
        >
          <Text style={styles.scoreText}>{ultimoRegistro ? nivelActual : '--'}</Text>
          <Text style={styles.scoreMax}>/10</Text>
        </Animated.View>

        <View style={styles.scoreDescription}>
          {ultimoRegistro ? (
            <>
              <Text style={[styles.scoreStatus, { color: getColorPorNivel(nivelActual) }]}>
                {getTextoDolor(nivelActual)}
              </Text>
              <Text style={styles.ultimoRegistroText}>
                Último control: {formatearFechaEva(ultimoRegistro.fecha)} • {ultimoRegistro.zonaAfectada}
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.scoreStatus, { color: THEME.colors.textSecondary }]}>
                Sin evaluaciones registradas
              </Text>
              <Text style={styles.ultimoRegistroText}>
                Tu fisioterapeuta registrará tu puntaje EVA en consulta
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Barra analógica visual del espectro continuo EVA con cursor animado */}
      <View style={styles.spectrumWrapper}>
        <View style={styles.spectrumTrack}>
          <View style={[styles.spectrumSegment, { backgroundColor: '#10B981', flex: 3 }]} />
          <View style={[styles.spectrumSegment, { backgroundColor: '#84CC16', flex: 2 }]} />
          <View style={[styles.spectrumSegment, { backgroundColor: '#F59E0B', flex: 2 }]} />
          <View style={[styles.spectrumSegment, { backgroundColor: '#F97316', flex: 2 }]} />
          <View style={[styles.spectrumSegment, { backgroundColor: '#EF4444', flex: 2 }]} />
        </View>

        <Animated.View
          style={[
            styles.spectrumThumb,
            {
              left: animatedThumbPosition,
              backgroundColor: animatedBgColor,
            },
          ]}
        />
      </View>

      <View style={styles.spectrumLabels}>
        <Text style={styles.spectrumLabelText}>0 Leve / Nulo</Text>
        <Text style={styles.spectrumLabelText}>5 Moderado</Text>
        <Text style={styles.spectrumLabelText}>10 Máximo</Text>
      </View>

      {/* Marcadores visuales de solo lectura de 0 a 10 */}
      <View style={styles.scaleContainer} accessibilityRole="text">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
          const isActivo = ultimoRegistro ? ultimoRegistro.nivelDolor === num : false;
          const bg = getColorPorNivel(num);
          return (
            <View
              key={num}
              style={[
                styles.scaleButton,
                isActivo && {
                  backgroundColor: bg,
                  borderColor: bg,
                  transform: [{ scale: 1.15 }],
                  ...THEME.shadows.card,
                },
              ]}
            >
              <Text style={[styles.scaleButtonText, isActivo && styles.scaleButtonTextActive]}>
                {num}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Historial de sesiones clínicas */}
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Registro en historias clínicas:</Text>
        {registrosOrdenados.slice(0, 3).map((r) => (
          <View key={r.id} style={styles.historyItem}>
            <Text style={styles.historyDate} numberOfLines={1}>
              {formatearFechaEva(r.fecha)}
            </Text>
            <View style={[styles.miniBadge, { backgroundColor: getColorPorNivel(r.nivelDolor) }]}>
              <Text style={styles.miniBadgeText}>EVA {r.nivelDolor}/10</Text>
            </View>
            <Text style={styles.historyComment} numberOfLines={1}>
              {r.comentario || r.zonaAfectada}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    ...THEME.shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  readOnlyBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 4,
  },
  readOnlyBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    marginBottom: 12,
    padding: 12,
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.sm,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'baseline',
    minWidth: 64,
    justifyContent: 'center',
    ...THEME.shadows.card,
  },
  scoreText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  scoreMax: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 2,
  },
  scoreDescription: {
    flex: 1,
  },
  scoreStatus: {
    fontSize: 14,
    fontWeight: '800',
  },
  ultimoRegistroText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  spectrumWrapper: {
    height: 14,
    justifyContent: 'center',
    marginVertical: 4,
    position: 'relative',
  },
  spectrumTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    flexDirection: 'row',
    opacity: 0.85,
  },
  spectrumSegment: {
    height: '100%',
  },
  spectrumThumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...THEME.shadows.card,
  },
  spectrumLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  spectrumLabelText: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
  scaleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  scaleButton: {
    width: 27,
    height: 34,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
  },
  scaleButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  scaleButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  historyContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.divider,
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    marginBottom: 6,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 3,
  },
  historyDate: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    width: 75,
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  historyComment: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    flex: 1,
  },
});
