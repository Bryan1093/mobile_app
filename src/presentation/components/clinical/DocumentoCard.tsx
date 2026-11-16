import { MaterialIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEME } from '../../theme/theme';
import { DocumentoMedico } from '../../../shared/types';

interface DocumentoCardProps {
  documento: DocumentoMedico;
  onPress?: (documento: DocumentoMedico) => void;
}

export const DocumentoCard: React.FC<DocumentoCardProps> = ({ documento, onPress }) => {
  const [cargando, setCargando] = useState(false);

  const tieneEjercicios = Boolean(documento.ejercicios && documento.ejercicios.length > 0);
  const tieneArchivoUrl = /^https?:\/\//i.test(documento.archivoUrl?.trim() ?? '');

  const getResumenClinico = (): string | null => {
    if (documento.ejercicios && documento.ejercicios.length > 0) {
      const frecuencias = Array.from(
        new Set(documento.ejercicios.map((e) => e.frecuencia).filter(Boolean))
      );
      const countLabel = `${documento.ejercicios.length} ejercicio${
        documento.ejercicios.length === 1 ? '' : 's'
      }`;
      const freqLabel = frecuencias.length > 0 ? ` · ${frecuencias.join(', ')}` : '';
      return `${countLabel}${freqLabel}`;
    }
    return documento.indicaciones?.trim() || null;
  };

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
    if (onPress) {
      onPress(documento);
      return;
    }
    if (!tieneArchivoUrl) {
      Alert.alert(
        'Archivo no disponible',
        tieneEjercicios
          ? 'Esta rutina no tiene un PDF externo adjunto. Ábrela desde la sección Tratamientos para ver sus ejercicios.'
          : 'El archivo PDF aún no está disponible.'
      );
      return;
    }
    try {
      setCargando(true);
      await WebBrowser.openBrowserAsync(documento.archivoUrl);
    } catch {
      Alert.alert('Error', 'No se pudo abrir el documento PDF.');
    } finally {
      setCargando(false);
    }
  };

  const badge = getTipoBadge();
  const resumenClinico = getResumenClinico();
  const mostrarBotonRutina = !tieneArchivoUrl && tieneEjercicios;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handleDescargarOVer}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <MaterialIcons
          name={tieneEjercicios ? 'fitness-center' : 'picture-as-pdf'}
          size={28}
          color={THEME.colors.primary}
        />
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

        {resumenClinico ? (
          <Text style={styles.resumenClinico} numberOfLines={1}>
            {resumenClinico}
          </Text>
        ) : null}

        {documento.indicaciones ? (
          <Text style={styles.indicacionesPreview} numberOfLines={2}>
            {documento.indicaciones}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Fecha: {documento.fechaEmision}</Text>
          <Text style={styles.metaBullet}>•</Text>
          <Text style={styles.metaText}>{documento.tamano}</Text>
        </View>
      </View>

      <View style={styles.actionContainer}>
        {cargando ? (
          <ActivityIndicator size="small" color={THEME.colors.primary} />
        ) : mostrarBotonRutina ? (
          <View style={styles.rutinaButton}>
            <MaterialIcons name="visibility" size={15} color="#FFFFFF" />
            <Text style={styles.rutinaButtonText}>Ver rutina / PDF</Text>
          </View>
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
  resumenClinico: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primaryDark,
    marginBottom: 3,
  },
  indicacionesPreview: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontStyle: 'italic',
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
  rutinaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  rutinaButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

