import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEME } from '../constants/theme';
import { RegistroEVA } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface EvaScaleCardProps {
  registros: RegistroEVA[];
  onRegistrarDolor?: (nivel: number) => void;
}

export const EvaScaleCard: React.FC<EvaScaleCardProps> = ({ registros }) => {
  const [seleccionado, setSeleccionado] = useState<number>(registros[0]?.nivelDolor ?? 3);
  const ultimoRegistro = registros[0];

  const getColorPorNivel = (nivel: number) => {
    if (nivel <= 2) return '#10B981'; // Verde: leve / sin dolor
    if (nivel <= 4) return '#84CC16'; // Verde claro / molestia leve
    if (nivel <= 6) return '#F59E0B'; // Amarillo / dolor moderado
    if (nivel <= 8) return '#F97316'; // Naranja / dolor severo
    return '#EF4444'; // Rojo / dolor muy severo / insoportable
  };

  const getTextoDolor = (nivel: number) => {
    if (nivel === 0) return 'Sin dolor (0/10)';
    if (nivel <= 3) return 'Dolor leve / Molestia';
    if (nivel <= 6) return 'Dolor moderado';
    if (nivel <= 8) return 'Dolor severo';
    return 'Dolor incapacitante';
  };

  const handleSeleccionar = (num: number) => {
    setSeleccionado(num);
    triggerHaptic('selection');
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MaterialIcons name="healing" size={20} color={THEME.colors.primary} />
        </View>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Evolución del Dolor (Escala EVA)</Text>
          <Text style={styles.subtitle}>Escala Visual Análoga clínica (0 = Sin dolor, 10 = Máximo dolor)</Text>
        </View>
      </View>

      {/* Indicador numérico principal */}
      <View style={styles.scoreRow}>
        <View style={[styles.scoreBadge, { backgroundColor: getColorPorNivel(seleccionado) }]}>
          <Text style={styles.scoreText}>{seleccionado}</Text>
          <Text style={styles.scoreMax}>/10</Text>
        </View>
        <View style={styles.scoreDescription}>
          <Text style={[styles.scoreStatus, { color: getColorPorNivel(seleccionado) }]}>
            {getTextoDolor(seleccionado)}
          </Text>
          {ultimoRegistro && (
            <Text style={styles.ultimoRegistroText}>
              Último control: {ultimoRegistro.fecha} • {ultimoRegistro.zonaAfectada}
            </Text>
          )}
        </View>
      </View>

      {/* Selector interactivo de 0 a 10 con respuesta táctil */}
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

      {/* Historial de sesiones */}
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
    marginVertical: 10,
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
  scaleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
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
