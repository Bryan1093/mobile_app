import { MaterialIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEME } from '../constants/theme';
import { Cita } from '../types';

interface CitaCardProps {
  cita: Cita;
  onCancelar?: (id: string) => void;
  onReagendar?: (cita: Cita) => void;
}

export const CitaCard: React.FC<CitaCardProps> = ({ cita, onCancelar, onReagendar }) => {
  const esProgramada = cita.estado === 'PROGRAMADA';
  const esCancelada = cita.estado === 'CANCELADA';

  const handleVerPDF = async () => {
    if (cita.documentoPrescripcionUrl) {
      try {
        await WebBrowser.openBrowserAsync(cita.documentoPrescripcionUrl);
      } catch (e) {
        Alert.alert('Documento', 'No se pudo abrir el archivo PDF en este momento.');
      }
    } else {
      Alert.alert(
        'Sin documento adjunto',
        'El fisioterapeuta aún no ha emitido una orden o informe PDF para esta sesión.'
      );
    }
  };

  const handleCancelar = () => {
    Alert.alert(
      'Cancelar Cita',
      `¿Confirmas la cancelación de tu cita para ${cita.especialidadNombre} el ${cita.fecha}?`,
      [
        { text: 'No, mantener', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: () => onCancelar && onCancelar(cita.id),
        },
      ]
    );
  };

  const getStatusColor = () => {
    switch (cita.estado) {
      case 'PROGRAMADA':
        return { bg: THEME.colors.primaryLight, text: THEME.colors.primary };
      case 'COMPLETADA':
        return { bg: THEME.colors.successLight, text: THEME.colors.success };
      case 'CANCELADA':
        return { bg: THEME.colors.dangerLight, text: THEME.colors.danger };
      default:
        return { bg: THEME.colors.borderLight, text: THEME.colors.textSecondary };
    }
  };

  const badge = getStatusColor();

  return (
    <View style={styles.card}>
      {/* Encabezado de la tarjeta */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.especialidad}>{cita.especialidadNombre}</Text>
          <Text style={styles.sede}>
            <MaterialIcons name="location-on" size={13} color={THEME.colors.textSecondary} /> {cita.sede}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>{cita.estado}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Detalles de la cita */}
      <View style={styles.detailsContainer}>
        <View style={styles.infoRow}>
          <MaterialIcons name="event" size={16} color={THEME.colors.primary} />
          <Text style={styles.infoLabel}>Fecha y Hora:</Text>
          <Text style={styles.infoValue}>
            {cita.fecha} ({cita.horaInicio} - {cita.horaFin})
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={16} color={THEME.colors.primary} />
          <Text style={styles.infoLabel}>Fisioterapeuta:</Text>
          <Text style={styles.infoValue}>{cita.fisioterapeutaNombreCompleto}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="badge" size={16} color={THEME.colors.primary} />
          <Text style={styles.infoLabel}>Paciente:</Text>
          <Text style={styles.infoValue}>{cita.pacienteNombreCompleto}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="payments" size={16} color={THEME.colors.textSecondary} />
          <Text style={styles.infoLabel}>Modalidad:</Text>
          <Text style={styles.infoValueMuted}>Pago presencial en recepción</Text>
        </View>
      </View>

      {/* Botones inferiores requeridos por el diseño */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.btnActionSecondary} onPress={handleVerPDF} activeOpacity={0.7}>
          <MaterialIcons name="picture-as-pdf" size={16} color={THEME.colors.primary} />
          <Text style={styles.btnActionSecondaryText}>Ver PDF</Text>
        </TouchableOpacity>

        {esProgramada && (
          <>
            <TouchableOpacity
              style={styles.btnActionDanger}
              onPress={handleCancelar}
              activeOpacity={0.7}
            >
              <MaterialIcons name="cancel" size={16} color={THEME.colors.danger} />
              <Text style={styles.btnActionDangerText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnActionPrimary}
              onPress={() => onReagendar && onReagendar(cita)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="edit-calendar" size={16} color="#FFFFFF" />
              <Text style={styles.btnActionPrimaryText}>Reagendar</Text>
            </TouchableOpacity>
          </>
        )}

        {esCancelada && (
          <View style={styles.canceladoBox}>
            <Text style={styles.canceladoText}>Cita anulada en recepción/app</Text>
          </View>
        )}
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
    ...THEME.shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    paddingRight: 8,
  },
  especialidad: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.primary,
    marginBottom: 4,
  },
  sede: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.divider,
    marginVertical: 12,
  },
  detailsContainer: {
    gap: 8,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: THEME.colors.textPrimary,
    fontWeight: '600',
    flexShrink: 1,
  },
  infoValueMuted: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderLight,
  },
  btnActionSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.primaryLight,
  },
  btnActionSecondaryText: {
    color: THEME.colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  btnActionDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.dangerLight,
  },
  btnActionDangerText: {
    color: THEME.colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  btnActionPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.primary,
  },
  btnActionPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  canceladoBox: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  canceladoText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
  },
});

