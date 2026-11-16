import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from '../../components/common/PressableScale';
import { RutinaDetalleModal } from '../../components/modals/RutinaDetalleModal';
import { THEME } from '../../theme/theme';
import { useAppointments } from '../../context/AppointmentContext';
import { useAuth } from '../../context/AuthContext';
import { DocumentoMedico } from '../../../shared/types';

export const MisDocumentosScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { documentos } = useAppointments();
  const { usuario } = useAuth();

  // Filtro exacto para la tesis: 'TODOS' | 'RUTINAS' | 'RECETAS'
  const [filtroActivo, setFiltroActivo] = useState<'TODOS' | 'RUTINAS' | 'RECETAS'>('TODOS');
  const [rutinaSeleccionada, setRutinaSeleccionada] = useState<DocumentoMedico | null>(null);

  const documentosFiltrados = documentos.filter((doc) => {
    if (filtroActivo === 'TODOS') return true;
    if (filtroActivo === 'RUTINAS') return doc.tipo === 'RUTINA_EJERCICIOS' || doc.tipo === 'RECOMENDACION_POSTURAL';
    if (filtroActivo === 'RECETAS') return doc.tipo === 'RECETA_MEDICA';
    return true;
  });

  const handleAbrirPDF = async (doc: DocumentoMedico) => {
    if (doc.ejercicios && doc.ejercicios.length > 0) {
      setRutinaSeleccionada(doc);
      return;
    }

    const tieneUrlReal = /^https?:\/\//i.test(doc.archivoUrl?.trim() ?? '');
    if (!tieneUrlReal) {
      Alert.alert(
        'Archivo no disponible',
        'El archivo PDF de este documento aún no está disponible.'
      );
      return;
    }

    try {
      await WebBrowser.openBrowserAsync(doc.archivoUrl);
    } catch {
      Alert.alert('Error', 'No se pudo abrir el documento PDF.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Cabecera Limpia */}
      <View
        style={[
          styles.headerTopWhite,
          { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 24 : 12) + 6 },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.btnAtras}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color="#002855" />
          <Text style={styles.btnAtrasText}>Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.pageMainTitle}>Tratamientos</Text>
        <Text style={styles.pageSubtitle}>Rutinas de ejercicios y recetas de medicamentos</Text>
      </View>

      {/* Píldoras de Filtro Específicas del Proyecto */}
      <View style={styles.filtrosRow}>
        <PressableScale
          onPress={() => setFiltroActivo('TODOS')}
          hapticStyle="light"
          style={[styles.filtroPill, filtroActivo === 'TODOS' && styles.filtroPillActive]}
        >
          <Text style={[styles.filtroText, filtroActivo === 'TODOS' && styles.filtroTextActive]}>
            Todos
          </Text>
        </PressableScale>

        <PressableScale
          onPress={() => setFiltroActivo('RUTINAS')}
          hapticStyle="light"
          style={[styles.filtroPill, filtroActivo === 'RUTINAS' && styles.filtroPillActive]}
        >
          <View style={styles.pillContentRow}>
            <MaterialIcons
              name="fitness-center"
              size={15}
              color={filtroActivo === 'RUTINAS' ? '#FFFFFF' : '#0052CC'}
            />
            <Text
              style={[styles.filtroText, filtroActivo === 'RUTINAS' && styles.filtroTextActive]}
            >
              Rutinas de Ejercicios
            </Text>
          </View>
        </PressableScale>

        <PressableScale
          onPress={() => setFiltroActivo('RECETAS')}
          hapticStyle="light"
          style={[styles.filtroPill, filtroActivo === 'RECETAS' && styles.filtroPillActive]}
        >
          <View style={styles.pillContentRow}>
            <MaterialIcons
              name="receipt-long"
              size={15}
              color={filtroActivo === 'RECETAS' ? '#FFFFFF' : '#0052CC'}
            />
            <Text
              style={[styles.filtroText, filtroActivo === 'RECETAS' && styles.filtroTextActive]}
            >
              Medicamentos / Recetas
            </Text>
          </View>
        </PressableScale>
      </View>

      {/* Lista de Documentos Médicos (Sin círculos raros de 2/4) */}
      <FlatList
        data={documentosFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const esRutina = item.tipo === 'RUTINA_EJERCICIOS' || item.tipo === 'RECOMENDACION_POSTURAL';
          const tieneEjercicios = Boolean(item.ejercicios && item.ejercicios.length > 0);
          const tieneUrlReal = /^https?:\/\//i.test(item.archivoUrl?.trim() ?? '');
          const frecuencias = tieneEjercicios
            ? Array.from(new Set(item.ejercicios!.map((e) => e.frecuencia).filter(Boolean)))
            : [];
          const resumenRutina = tieneEjercicios
            ? `${item.ejercicios!.length} ejercicio${item.ejercicios!.length === 1 ? '' : 's'}${
                frecuencias.length > 0 ? ` · ${frecuencias.join(', ')}` : ''
              }`
            : null;

          return (
            <View style={styles.cardDocumento}>
              <View style={styles.cardHeaderRow}>
                {/* Badge de Categoría */}
                <View
                  style={[
                    styles.categoriaBadge,
                    { backgroundColor: esRutina ? '#E0F2FE' : '#FCE7F3' },
                  ]}
                >
                  <MaterialIcons
                    name={esRutina ? 'fitness-center' : 'medication'}
                    size={14}
                    color={esRutina ? '#0284C7' : '#DB2777'}
                  />
                  <Text
                    style={[
                      styles.categoriaBadgeText,
                      { color: esRutina ? '#0284C7' : '#DB2777' },
                    ]}
                  >
                    {esRutina ? 'Rutina de Ejercicios' : 'Receta / Medicamento'}
                  </Text>
                </View>

                <Text style={styles.fechaEmisionText}>{item.fechaEmision}</Text>
              </View>

              <Text style={styles.docTitulo}>{item.titulo}</Text>

              <View style={styles.docMetaRow}>
                <MaterialIcons name="person" size={15} color="#64748B" />
                <Text style={styles.docMetaText}>
                  Prescrito por: <Text style={styles.docBold}>{item.fisioterapeutaNombre}</Text>
                </Text>
              </View>

              <View style={styles.docMetaRow}>
                <MaterialIcons name="folder-open" size={15} color="#64748B" />
                <Text style={styles.docMetaText}>
                  Paciente: <Text style={styles.docBold}>{usuario?.nombres} {usuario?.apellidos}</Text>
                </Text>
              </View>

              {resumenRutina ? (
                <View style={styles.docMetaRow}>
                  <MaterialIcons name="repeat" size={15} color="#1B6B53" />
                  <Text style={styles.docResumenText}>{resumenRutina}</Text>
                </View>
              ) : null}

              {item.indicaciones ? (
                <View style={styles.indicacionesPreviewBox}>
                  <Text style={styles.indicacionesPreviewText} numberOfLines={2}>
                    {item.indicaciones}
                  </Text>
                </View>
              ) : null}

              <View style={styles.cardDivider} />

              {/* Botón para ver rutina o descargar el PDF */}
              <View style={styles.actionRow}>
                <View style={styles.tamanoBadge}>
                  <MaterialIcons
                    name={tieneEjercicios && !tieneUrlReal ? 'fitness-center' : 'picture-as-pdf'}
                    size={16}
                    color={tieneEjercicios && !tieneUrlReal ? '#1B6B53' : '#DC2626'}
                  />
                  <Text style={styles.tamanoText}>
                    {tieneEjercicios && !tieneUrlReal
                      ? `Rutina (${item.tamano})`
                      : `Formato PDF (${item.tamano})`}
                  </Text>
                </View>

                <PressableScale
                  onPress={() => handleAbrirPDF(item)}
                  hapticStyle="medium"
                  style={styles.btnVerPdfWrapper}
                >
                  <View style={styles.btnVerPdf}>
                    <MaterialIcons
                      name={tieneEjercicios ? 'visibility' : 'file-download'}
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={styles.btnVerPdfText}>
                      {tieneEjercicios ? 'Ver rutina / PDF' : 'Ver PDF'}
                    </Text>
                  </View>
                </PressableScale>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="folder-open" size={50} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Sin documentos en esta sección</Text>
            <Text style={styles.emptySub}>
              Cuando tu fisioterapeuta emita guías de ejercicios o recetas de medicamentos, aparecerán aquí.
            </Text>
          </View>
        }
      />

      <RutinaDetalleModal
        visible={Boolean(rutinaSeleccionada)}
        documento={rutinaSeleccionada}
        pacienteNombre={usuario ? `${usuario.nombres} ${usuario.apellidos}`.trim() : undefined}
        onClose={() => setRutinaSeleccionada(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerTopWhite: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  btnAtras: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  btnAtrasText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B6B53',
  },
  pageMainTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F2820',
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#5A6872',
    marginTop: 2,
  },
  filtrosRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filtroPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  filtroPillActive: {
    backgroundColor: '#1B6B53',
    borderColor: '#1B6B53',
  },
  pillContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filtroText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2820',
  },
  filtroTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 14,
  },
  cardDocumento: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...THEME.shadows.card,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoriaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoriaBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  fechaEmisionText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  docTitulo: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F2820',
    lineHeight: 20,
    marginBottom: 8,
  },
  docMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  docMetaText: {
    fontSize: 12,
    color: '#475569',
  },
  docBold: {
    fontWeight: '700',
    color: '#0F2820',
  },
  docResumenText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B6B53',
  },
  indicacionesPreviewBox: {
    marginTop: 6,
    backgroundColor: '#E8F5F1',
    borderLeftWidth: 3,
    borderLeftColor: '#1B6B53',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  indicacionesPreviewText: {
    fontSize: 12,
    color: '#0F2820',
    lineHeight: 17,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginVertical: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tamanoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tamanoText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  btnVerPdfWrapper: {
    minWidth: 110,
  },
  btnVerPdf: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1B6B53',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  btnVerPdfText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#002855',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});
