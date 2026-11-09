import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { THEME } from '../constants/theme';
import { RegistroEVA } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface EvaScaleCardProps {
  registros: RegistroEVA[];
  onRegistrarDolor?: (nivel: number) => void;
}

export const EvaScaleCard: React.FC<EvaScaleCardProps> = ({
  registros,
  onRegistrarDolor,
}) => {
  const [seleccionado, setSeleccionado] = useState<number>(registros[0]?.nivelDolor ?? 3);
  const ultimoRegistro = registros[0];

  // Animaciones nativas y de interpolación de color con inicialización React 19
  const [animatedLevel] = useState(() => new Animated.Value(registros[0]?.nivelDolor ?? 3));
  const [badgeScale] = useState(() => new Animated.Value(1));
  const [textOpacity] = useState(() => new Animated.Value(1));

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

  const handleSeleccionar = (num: number) => {
    if (num === seleccionado) return;
    setSeleccionado(num);
    triggerHaptic('selection');
    onRegistrarDolor?.(num);

    // Micro-animación de fade en el texto descriptivo
    Animated.sequence([
      Animated.timing(textOpacity, {
        toValue: 0.35,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();

    // Micro-animación de escala táctil en el badge numérico (60 FPS nativo)
    Animated.sequence([
      Animated.timing(badgeScale, {
        toValue: 1.15,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(badgeScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // Interpolación continua y suave del color y del indicador de escala
    Animated.timing(animatedLevel, {
      toValue: num,
      duration: 250,
      useNativeDriver: false,
    }).start();
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

      {/* Indicador numérico animado con interpolación de color y bounce */}
      <View style={styles.scoreRow}>
        <Animated.View
          style={[
            styles.scoreBadge,
            {
              backgroundColor: animatedBgColor,
              transform: [{ scale: badgeScale }],
            },
          ]}
        >
          <Text style={styles.scoreText}>{seleccionado}</Text>
          <Text style={styles.scoreMax}>/10</Text>
        </Animated.View>

        <Animated.View style={[styles.scoreDescription, { opacity: textOpacity }]}>
          <Text style={[styles.scoreStatus, { color: getColorPorNivel(seleccionado) }]}>
            {getTextoDolor(seleccionado)}
          </Text>
          {ultimoRegistro && (
            <Text style={styles.ultimoRegistroText}>
              Último control: {ultimoRegistro.fecha} • {ultimoRegistro.zonaAfectada}
            </Text>
          )}
        </Animated.View>
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

      {/* Selector interactivo de 0 a 10 con botones táctiles */}
      <View style={styles.scaleContainer}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
          const isActivo = seleccionado === num;
          const bg = getColorPorNivel(num);
          return (
            <TouchableOpacity
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
              onPress={() => handleSeleccionar(num)}
              activeOpacity={0.7}
            >
              <Text style={[styles.scaleButtonText, isActivo && styles.scaleButtonTextActive]}>
                {num}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Historial de sesiones clínicas */}
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Registro en historias clínicas:</Text>
        {registros.slice(0, 3).map((r) => (
          <View key={r.id} style={styles.historyItem}>
            <Text style={styles.historyDate}>{r.fecha}</Text>
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
