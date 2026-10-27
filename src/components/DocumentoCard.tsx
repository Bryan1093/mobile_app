import { MaterialIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEME } from '../constants/theme';
import { DocumentoMedico } from '../types';

interface DocumentoCardProps {
  documento: DocumentoMedico;
}

export const DocumentoCard: React.FC<DocumentoCardProps> = ({ documento }) => {
  const [cargando, setCargando] = useState(false);

  const getTipoBadge = () => {
    switch (documento.tipo) {
      case 'RUTINA_EJERCICIOS':
        return { label: 'Rutina de Ejercicios', icon: 'fitness-center' as const };
      case 'RECOMENDACION_POSTURAL':
        return { label: 'Guía Postural', icon: 'accessibility' as const };
      case 'RECETA_MEDICA':
        return { label: 'Receta / Orden', icon: 'receipt-long' as const };
      case 'INFORME_EVOLUCION':
        return { label: 'Informe Clínico', icon: 'assignment' as const };
    }
  };

  const handleDescargarOVer = async () => {
    try {
      setCargando(true);
      // Abre el PDF en el visor nativo / navegador seguro
      await WebBrowser.openBrowserAsync(documento.archivoUrl);
    } catch (e) {
      Alert.alert('Error', 'No se pudo abrir el documento PDF.');
    } finally {
      setCargando(false);
    }
  };

  const badge = getTipoBadge();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handleDescargarOVer}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <MaterialIcons name="picture-as-pdf" size={32} color={THEME.colors.primary} />
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.tipoRow}>
          <MaterialIcons name={badge.icon} size={14} color={THEME.colors.primary} />
          <Text style={styles.tipoLabel}>{badge.label}</Text>
        </View>

        <Text style={styles.titulo} numberOfLines={2}>
          {documento.titulo}
        </Text>

        <Text style={styles.fisioterapeuta}>
          Prescrito por: {documento.fisioterapeutaNombre}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Fecha: {documento.fechaEmision}</Text>
          <Text style={styles.metaBullet}>•</Text>
          <Text style={styles.metaText}>{documento.tamano}</Text>
        </View>
      </View>

      <View style={styles.actionContainer}>
        {cargando ? (
          <ActivityIndicator size="small" color={THEME.colors.primary} />
        ) : (
          <View style={styles.downloadButton}>
            <MaterialIcons name="file-download" size={22} color="#FFFFFF" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    padding: 16,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    ...THEME.shadows.card,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    paddingRight: 8,
  },
  tipoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  tipoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
    textTransform: 'uppercase',
  },
  titulo: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    lineHeight: 19,
    marginBottom: 4,
  },
  fisioterapeuta: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  metaBullet: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  actionContainer: {
    paddingLeft: 4,
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

