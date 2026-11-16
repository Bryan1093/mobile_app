import { MaterialIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DocumentoMedico, EjercicioRutina } from '../../../shared/types';
import { THEME } from '../../theme/theme';

interface RutinaDetalleModalProps {
  visible: boolean;
  documento: DocumentoMedico | null;
  pacienteNombre?: string;
  onClose: () => void;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildRutinaHtml(documento: DocumentoMedico, pacienteNombre?: string): string {
  const ejercicios = documento.ejercicios ?? [];
  const estadoTexto = documento.activa === false ? 'Finalizada' : 'Activa';
  const estadoColor = documento.activa === false ? '#475569' : '#059669';
  const estadoBg = documento.activa === false ? '#F1F5F9' : '#ECFDF5';

  const indicacionesHtml = documento.indicaciones
    ? `
      <div class="indicaciones-box">
        <div class="indicaciones-title">Recomendaciones para el paciente</div>
        <p class="indicaciones-text">${escapeHtml(documento.indicaciones)}</p>
      </div>
    `
    : '';

  const ejerciciosHtml = ejercicios
    .map(
      (ej: EjercicioRutina, index: number) => `
      <div class="ejercicio-card">
        <div class="ejercicio-header">
          <div class="ejercicio-title-row">
            <span class="orden-badge">${ej.orden || index + 1}</span>
            <span class="ejercicio-nombre">${escapeHtml(ej.nombre)}</span>
          </div>
          <span class="zona-badge">${escapeHtml(ej.zona)}</span>
        </div>
        ${
          ej.descripcion
            ? `<p class="ejercicio-desc">${escapeHtml(ej.descripcion)}</p>`
            : ''
        }
        <div class="dosificacion-row">
          <span class="dosificacion-pill">${ej.series} series de ${ej.repeticiones} repeticiones</span>
          <span class="frecuencia-pill">Frecuencia: ${escapeHtml(ej.frecuencia)}</span>
        </div>
        ${
          ej.notas
            ? `<div class="nota-box"><strong>Nota:</strong> ${escapeHtml(ej.notas)}</div>`
            : ''
        }
      </div>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(documento.titulo)} - Innova Fisioterapia</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0F2820;
            margin: 0;
            padding: 28px;
            background: #FFFFFF;
            line-height: 1.45;
          }
          .brand-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #1B6B53;
            padding-bottom: 14px;
            margin-bottom: 20px;
          }
          .brand-name {
            font-size: 20px;
            font-weight: 800;
            color: #1B6B53;
            margin: 0;
          }
          .brand-sub {
            font-size: 12px;
            color: #5A6872;
            margin: 2px 0 0 0;
          }
          .estado-pill {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 700;
            color: ${estadoColor};
            background: ${estadoBg};
          }
          .doc-title {
            font-size: 22px;
            font-weight: 800;
            color: #0F2820;
            margin: 0 0 12px 0;
          }
          .meta-grid {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            padding: 12px 14px;
            margin-bottom: 18px;
            font-size: 13px;
          }
          .meta-row {
            margin: 4px 0;
          }
          .meta-label {
            color: #5A6872;
            font-weight: 600;
          }
          .indicaciones-box {
            background: #E8F5F1;
            border-left: 4px solid #1B6B53;
            border-radius: 6px;
            padding: 12px 14px;
            margin-bottom: 20px;
          }
          .indicaciones-title {
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            color: #145340;
            margin-bottom: 4px;
          }
          .indicaciones-text {
            margin: 0;
            font-size: 13px;
            color: #0F2820;
          }
          .section-title {
            font-size: 14px;
            font-weight: 800;
            text-transform: uppercase;
            color: #1B6B53;
            margin: 0 0 12px 0;
            letter-spacing: 0.4px;
          }
          .ejercicio-card {
            border: 1px solid #E2E8F0;
            border-radius: 10px;
            padding: 14px;
            margin-bottom: 12px;
            page-break-inside: avoid;
          }
          .ejercicio-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
          }
          .ejercicio-title-row {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .orden-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            border-radius: 12px;
            background: #1B6B53;
            color: #FFFFFF;
            font-size: 12px;
            font-weight: 800;
          }
          .ejercicio-nombre {
            font-size: 15px;
            font-weight: 700;
            color: #0F2820;
          }
          .zona-badge {
            font-size: 11px;
            font-weight: 700;
            color: #0284C7;
            background: #E0F2FE;
            padding: 3px 8px;
            border-radius: 6px;
          }
          .ejercicio-desc {
            margin: 0 0 10px 0;
            font-size: 13px;
            color: #475569;
          }
          .dosificacion-row {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          .dosificacion-pill {
            font-size: 12px;
            font-weight: 700;
            color: #145340;
            background: #E8F5F1;
            padding: 4px 10px;
            border-radius: 6px;
          }
          .frecuencia-pill {
            font-size: 12px;
            font-weight: 700;
            color: #1D4ED8;
            background: #EFF6FF;
            padding: 4px 10px;
            border-radius: 6px;
          }
          .nota-box {
            margin-top: 10px;
            padding: 8px 10px;
            background: #FFFBEB;
            border: 1px solid #FDE68A;
            border-radius: 6px;
            font-size: 12px;
            color: #92400E;
          }
          .footer {
            margin-top: 24px;
            padding-top: 10px;
            border-top: 1px solid #E2E8F0;
            font-size: 11px;
            color: #94A3B8;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="brand-header">
          <div>
            <p class="brand-name">Innova Fisioterapia</p>
            <p class="brand-sub">Prescripción de Rutina de Ejercicios Terapéuticos</p>
          </div>
          <span class="estado-pill">${estadoTexto}</span>
        </div>

        <h1 class="doc-title">${escapeHtml(documento.titulo)}</h1>

        <div class="meta-grid">
          ${
            pacienteNombre
              ? `<div class="meta-row"><span class="meta-label">Paciente:</span> ${escapeHtml(pacienteNombre)}</div>`
              : ''
          }
          <div class="meta-row"><span class="meta-label">Fisioterapeuta prescriptor:</span> ${escapeHtml(documento.fisioterapeutaNombre)}</div>
          <div class="meta-row"><span class="meta-label">Fecha de emisión:</span> ${escapeHtml(documento.fechaEmision)}</div>
        </div>

        ${indicacionesHtml}

        <div class="section-title">Plan de ejercicios (${ejercicios.length})</div>
        ${ejerciciosHtml}

        <div class="footer">
          Documento clínico generado desde la aplicación móvil de Innova Fisioterapia
        </div>
      </body>
    </html>
  `;
}

export const RutinaDetalleModal: React.FC<RutinaDetalleModalProps> = ({
  visible,
  documento,
  pacienteNombre,
  onClose,
}) => {
  const [generandoPdf, setGenerandoPdf] = useState(false);

  if (!documento) return null;

  const ejercicios = documento.ejercicios ?? [];
  const esActiva = documento.activa !== false;

  const handleDescargarPdf = async () => {
    const html = buildRutinaHtml(documento, pacienteNombre);
    try {
      setGenerandoPdf(true);
      if (Platform.OS === 'web') {
        try {
          await Print.printAsync({ html });
        } catch {
          const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, '_blank', 'noopener,noreferrer');
        }
        return;
      }

      const { uri } = await Print.printToFileAsync({ html });
      const puedeCompartir = await Sharing.isAvailableAsync();
      if (puedeCompartir) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: documento.titulo,
          UTI: 'com.adobe.pdf',
        });
      } else {
        await Print.printAsync({ html });
      }
    } catch {
      Alert.alert('Error', 'No se pudo generar o compartir el PDF de la rutina.');
    } finally {
      setGenerandoPdf(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Cabecera */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconBox}>
                <MaterialIcons name="fitness-center" size={22} color={THEME.colors.primary} />
              </View>
              <View style={styles.headerTitleContainer}>
                <View style={styles.badgeRow}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: esActiva ? THEME.colors.successLight : THEME.colors.borderLight },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: esActiva ? '#059669' : '#475569' },
                      ]}
                    >
                      {esActiva ? 'Activa' : 'Finalizada'}
                    </Text>
                  </View>
                  <Text style={styles.fechaText}>{documento.fechaEmision}</Text>
                </View>
                <Text style={styles.title} numberOfLines={2}>
                  {documento.titulo}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Cerrar">
              <MaterialIcons name="close" size={22} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Meta del prescriptor */}
            <View style={styles.metaCard}>
              <View style={styles.metaRow}>
                <MaterialIcons name="person" size={16} color={THEME.colors.primary} />
                <Text style={styles.metaText}>
                  Fisioterapeuta: <Text style={styles.metaBold}>{documento.fisioterapeutaNombre}</Text>
                </Text>
              </View>
              {pacienteNombre ? (
                <View style={styles.metaRow}>
                  <MaterialIcons name="badge" size={16} color={THEME.colors.primary} />
                  <Text style={styles.metaText}>
                    Paciente: <Text style={styles.metaBold}>{pacienteNombre}</Text>
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Recomendaciones para el paciente */}
            {documento.indicaciones ? (
              <View style={styles.indicacionesBox}>
                <View style={styles.indicacionesHeader}>
                  <MaterialIcons name="info" size={17} color={THEME.colors.primaryDark} />
                  <Text style={styles.indicacionesTitle}>Recomendaciones para el paciente</Text>
                </View>
                <Text style={styles.indicacionesText}>{documento.indicaciones}</Text>
              </View>
            ) : null}

            {/* Lista de ejercicios */}
            <Text style={styles.sectionLabel}>
              Ejercicios prescritos ({ejercicios.length})
            </Text>

            {ejercicios.map((ej, idx) => (
              <View key={`${ej.orden}-${ej.nombre}-${idx}`} style={styles.ejercicioCard}>
                <View style={styles.ejercicioTopRow}>
                  <View style={styles.ejercicioTitleGroup}>
                    <View style={styles.ordenCircle}>
                      <Text style={styles.ordenText}>{ej.orden || idx + 1}</Text>
                    </View>
                    <Text style={styles.ejercicioNombre}>{ej.nombre}</Text>
                  </View>
                  <View style={styles.zonaChip}>
                    <Text style={styles.zonaText}>{ej.zona}</Text>
                  </View>
                </View>

                {ej.descripcion ? (
                  <Text style={styles.ejercicioDescripcion}>{ej.descripcion}</Text>
                ) : null}

                <View style={styles.dosificacionRow}>
                  <View style={styles.seriesBadge}>
                    <MaterialIcons name="repeat" size={14} color={THEME.colors.primaryDark} />
                    <Text style={styles.seriesText}>
                      {ej.series} {ej.series === 1 ? 'serie' : 'series'} de {ej.repeticiones} repeticiones
                    </Text>
                  </View>
                  <View style={styles.frecuenciaBadge}>
                    <MaterialIcons name="schedule" size={14} color="#1D4ED8" />
                    <Text style={styles.frecuenciaText}>{ej.frecuencia}</Text>
                  </View>
                </View>

                {ej.notas ? (
                  <View style={styles.notaBox}>
                    <MaterialIcons name="sticky-note-2" size={14} color="#92400E" />
                    <Text style={styles.notaText}>{ej.notas}</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </ScrollView>

          {/* Footer con botón de PDF */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.pdfButton, generandoPdf && styles.pdfButtonDisabled]}
              onPress={handleDescargarPdf}
              disabled={generandoPdf}
              activeOpacity={0.85}
            >
              {generandoPdf ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialIcons name="picture-as-pdf" size={20} color="#FFFFFF" />
                  <Text style={styles.pdfButtonText}>Descargar / Imprimir PDF</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 40, 32, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '90%',
    minHeight: '55%',
    ...THEME.shadows.modal,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingRight: 8,
  },
  headerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: THEME.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  headerTitleContainer: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  fechaText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
    lineHeight: 22,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: THEME.colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    gap: 14,
  },
  metaCard: {
    backgroundColor: THEME.colors.background,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    flex: 1,
  },
  metaBold: {
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  indicacionesBox: {
    backgroundColor: THEME.colors.primaryLight,
    borderLeftWidth: 4,
    borderLeftColor: THEME.colors.primary,
    borderRadius: 8,
    padding: 12,
  },
  indicacionesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  indicacionesTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.primaryDark,
    textTransform: 'uppercase',
  },
  indicacionesText: {
    fontSize: 13,
    color: THEME.colors.textPrimary,
    lineHeight: 19,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 2,
  },
  ejercicioCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 10,
  },
  ejercicioTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  ejercicioTitleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ordenCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ordenText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  ejercicioNombre: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  zonaChip: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  zonaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  ejercicioDescripcion: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
  dosificacionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  seriesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  seriesText: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.primaryDark,
  },
  frecuenciaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  frecuenciaText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  notaBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    padding: 9,
  },
  notaText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 17,
  },
  footer: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 13,
    borderRadius: 12,
  },
  pdfButtonDisabled: {
    opacity: 0.7,
  },
  pdfButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
