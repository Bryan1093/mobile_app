import { MaterialIcons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useQueries } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {
  Image,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HorariosModal } from '../../components/modals/HorariosModal';
import { PressableScale } from '../../components/common/PressableScale';
import { FisioterapeutaCardSkeleton } from '../../components/common/SkeletonLoader';
import { THEME } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { appointmentRepository } from '../../../infrastructure/container';
import { APPOINTMENT_KEYS, useEspecialidades, useFisioterapeutas } from '../../hooks';
import { BloqueHorario, CitasStackParamList, Fisioterapeuta } from '../../../shared/types';

export const SeleccionHorarioScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<CitasStackParamList, 'SeleccionHorario'>>();
  const { usuario } = useAuth();

  const {
    data: especialidadesData,
    isLoading: loadingEsp,
    isError: errorEsp,
    error: errorEspObj,
    refetch: refetchEsp,
  } = useEspecialidades();
  const {
    data: fisioterapeutasData,
    isLoading: loadingFisio,
    isError: errorFisio,
    error: errorFisioObj,
    refetch: refetchFisio,
  } = useFisioterapeutas();

  const especialidades = useMemo(() => especialidadesData ?? [], [especialidadesData]);
  const fisioterapeutas = useMemo(() => fisioterapeutasData ?? [], [fisioterapeutasData]);
  const [refreshing, setRefreshing] = useState(false);

  // Filtro de Especialidad seleccionado (o 'TODAS')
  const [especialidadFiltroSeleccionado, setEspecialidadFiltro] = useState<string>(() => {
    return route.params?.especialidadIdPrevia || 'TODAS';
  });

  // Si la especialidad previa no existe en el catálogo actual (ej. fue desactivada o viene de un ID antiguo), usar 'TODAS'
  const especialidadFiltro = useMemo(() => {
    if (
      especialidadFiltroSeleccionado !== 'TODAS' &&
      especialidades.length > 0 &&
      !especialidades.some((e) => e.id === especialidadFiltroSeleccionado)
    ) {
      return 'TODAS';
    }
    return especialidadFiltroSeleccionado;
  }, [especialidadFiltroSeleccionado, especialidades]);

  // Generador de días en carrusel
  const diasDisponibles = useMemo(() => {
    const dias = [];
    const nombresDias = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];
    const nombresMeses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    const hoy = new Date();

    for (let i = 0; i < 14; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);

      // En Innova Fisioterapia no hay atención los domingos
      if (fecha.getDay() === 0) continue;

      const yyyy = fecha.getFullYear();
      const mm = String(fecha.getMonth() + 1).padStart(2, '0');
      const dd = String(fecha.getDate()).padStart(2, '0');

      dias.push({
        id: `${yyyy}-${mm}-${dd}`,
        esHoy: i === 0,
        diaSemana: nombresDias[fecha.getDay()],
        numeroDia: dd,
        mesNombre: nombresMeses[fecha.getMonth()],
        anio: yyyy,
        fechaCompleta: `${yyyy}-${mm}-${dd}`,
      });
    }
    return dias;
  }, []);

  const [diaSeleccionado, setDiaSeleccionado] = useState(diasDisponibles[0]);

  // Modal de "Ver más horarios"
  const [modalHorariosVisible, setModalHorariosVisible] = useState(false);
  const [fisioterapeutaModal, setFisioterapeutaModal] = useState<Fisioterapeuta | null>(null);

  // Fisioterapeutas filtrados por la especialidad seleccionada
  const fisioterapeutasFiltrados = useMemo(() => {
    if (especialidadFiltro === 'TODAS') return fisioterapeutas;
    return fisioterapeutas.filter(
      (f) => f.especialidadesIds.length === 0 || f.especialidadesIds.includes(especialidadFiltro)
    );
  }, [especialidadFiltro, fisioterapeutas]);

  const servicioIdParaConsulta = useMemo(() => {
    if (especialidadFiltro !== 'TODAS') return especialidadFiltro;
    return especialidades[0]?.id;
  }, [especialidadFiltro, especialidades]);

  const disponibilidadQueries = useQueries({
    queries: fisioterapeutasFiltrados.map((fisio) => ({
      queryKey: APPOINTMENT_KEYS.disponibilidad(
        diaSeleccionado.fechaCompleta,
        fisio.id,
        servicioIdParaConsulta
      ),
      queryFn: () =>
        appointmentRepository.getDisponibilidad(
          diaSeleccionado.fechaCompleta,
          fisio.id,
          servicioIdParaConsulta
        ),
      enabled: Boolean(
        usuario && diaSeleccionado?.fechaCompleta && fisio.id && servicioIdParaConsulta
      ),
      staleTime: 1000 * 15,
    })),
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchEsp(), refetchFisio()]);
      await Promise.all(disponibilidadQueries.map((q) => q.refetch()));
    } finally {
      setRefreshing(false);
    }
  };

  // Bloques para el modal del fisioterapeuta activo
  const modalQueryIndex = fisioterapeutaModal
    ? fisioterapeutasFiltrados.findIndex((f) => f.id === fisioterapeutaModal.id)
    : -1;
  const bloquesDelFisioModal =
    modalQueryIndex >= 0 ? (disponibilidadQueries[modalQueryIndex]?.data ?? []) : [];
  const loadingModalBloques =
    modalQueryIndex >= 0 ? (disponibilidadQueries[modalQueryIndex]?.isLoading ?? false) : false;

  // Navegar a confirmación con el bloque elegido
  const handleConfirmarBloque = (fisio: Fisioterapeuta, bloque: BloqueHorario) => {
    const esp =
      (especialidadFiltro !== 'TODAS'
        ? especialidades.find((e) => e.id === especialidadFiltro)
        : undefined) ||
      especialidades.find((e) => fisio.especialidadesIds.includes(e.id)) ||
      especialidades[0];

    const bloqueObj: BloqueHorario = {
      ...bloque,
      disponible: true,
      fisioterapeutaId: fisio.id,
      fecha: diaSeleccionado.fechaCompleta,
    };

    setModalHorariosVisible(false);

    navigation.navigate('ConfirmarCita', {
      especialidad: esp,
      fisioterapeuta: fisio,
      fecha: diaSeleccionado.fechaCompleta,
      bloqueHorario: bloqueObj,
    });
  };

  const handleAbrirMasHorarios = (fisio: Fisioterapeuta) => {
    setFisioterapeutaModal(fisio);
    setModalHorariosVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Cabecera Blanca Estilo MiVeris */}
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
        <Text style={styles.pageMainTitle}>Datos para la cita</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Banner Azul Marino de Fechas (Idéntico a MiVeris) */}
        <View style={styles.verisNavyBanner}>
          <View style={styles.monthHeaderRow}>
            <TouchableOpacity style={styles.chevronBtn}>
              <MaterialIcons name="chevron-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {diaSeleccionado.mesNombre} {diaSeleccionado.anio}
            </Text>
            <TouchableOpacity style={styles.chevronBtn}>
              <MaterialIcons name="chevron-right" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Carrusel horizontal de tarjetas blancas de fecha */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateCardsRow}
          >
            {diasDisponibles.map((dia) => {
              const isSelected = diaSeleccionado.id === dia.id;
              return (
                <PressableScale
                  key={dia.id}
                  onPress={() => setDiaSeleccionado(dia)}
                  hapticStyle="selection"
                  style={[styles.verisDateCard, isSelected && styles.verisDateCardSelected]}
                  contentStyle={styles.verisDateCardContent}
                >
                  <View style={styles.verisDateCardInner}>
                    <Text style={[styles.verisHoyText, isSelected && styles.verisHoyTextSelected]}>
                      {dia.esHoy ? 'Hoy' : ' '}
                    </Text>
                    <Text style={[styles.verisDayText, isSelected && styles.verisDayTextSelected]}>
                      {dia.diaSemana}
                    </Text>
                    <Text
                      style={[styles.verisNumberText, isSelected && styles.verisNumberTextSelected]}
                    >
                      {dia.numeroDia}
                    </Text>
                  </View>
                </PressableScale>
              );
            })}
          </ScrollView>
        </View>

        {/* Sección: Filtrar por especialidad */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Filtrar por especialidad:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterPillsRow}
          >
            <PressableScale
              onPress={() => setEspecialidadFiltro('TODAS')}
              hapticStyle="light"
              style={[
                styles.filterPill,
                especialidadFiltro === 'TODAS' && styles.filterPillActive,
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  especialidadFiltro === 'TODAS' && styles.filterPillTextActive,
                ]}
              >
                Todas
              </Text>
            </PressableScale>

            {especialidades.map((esp) => {
              const isActivo = especialidadFiltro === esp.id;
              return (
                <PressableScale
                  key={esp.id}
                  onPress={() => setEspecialidadFiltro(esp.id)}
                  hapticStyle="light"
                  style={[styles.filterPill, isActivo && styles.filterPillActive]}
                >
                  <Text style={[styles.filterPillText, isActivo && styles.filterPillTextActive]}>
                    {esp.nombre}
                  </Text>
                </PressableScale>
              );
            })}
          </ScrollView>
        </View>

        {/* Lista de Fisioterapeutas con el patrón de MiVeris */}
        <View style={styles.doctorsListSection}>
          {(loadingFisio || loadingEsp) && !fisioterapeutasData ? (
            <>
              <FisioterapeutaCardSkeleton />
              <FisioterapeutaCardSkeleton />
            </>
          ) : errorFisio || errorEsp ? (
            <View style={styles.emptyStateBox}>
              <MaterialIcons name="wifi-off" size={36} color={THEME.colors.danger} />
              <Text style={styles.emptyStateTitle}>No se pudo cargar la agenda</Text>
              <Text style={styles.emptyStateSub}>
                {(errorFisioObj as Error)?.message ||
                  (errorEspObj as Error)?.message ||
                  'Verifica tu conexión con el servidor de Innova Fisioterapia.'}
              </Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={handleRefresh}
                activeOpacity={0.8}
              >
                <Text style={styles.retryBtnText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : fisioterapeutasFiltrados.length === 0 ? (
            <View style={styles.emptyStateBox}>
              <MaterialIcons name="person-search" size={36} color={THEME.colors.textMuted} />
              <Text style={styles.emptyStateTitle}>Sin fisioterapeutas disponibles</Text>
              <Text style={styles.emptyStateSub}>
                {especialidadFiltro !== 'TODAS'
                  ? 'No hay especialistas registrados para esta categoría. Prueba seleccionando "Todas".'
                  : 'Aún no hay fisioterapeutas activos registrados en el sistema.'}
              </Text>
              {especialidadFiltro !== 'TODAS' && (
                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={() => setEspecialidadFiltro('TODAS')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.retryBtnText}>Ver todos los especialistas</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            fisioterapeutasFiltrados.map((fisio, index) => {
            const espPrincipal =
              fisio.especialidad ||
              especialidades.find((e) => fisio.especialidadesIds.includes(e.id))?.nombre ||
              'Fisioterapia';
            const bloques = disponibilidadQueries[index]?.data ?? [];
            const proximoHorario = bloques[0];

            return (
              <View key={fisio.id} style={styles.doctorCard}>
                {/* Info superior del fisioterapeuta */}
                <View style={styles.doctorHeader}>
                  <View style={styles.doctorAvatarContainer}>
                    <Image source={{ uri: fisio.fotoUrl }} style={styles.doctorAvatar} />
                  </View>
                  <View style={styles.doctorDetails}>
                    <Text style={styles.doctorName}>
                      {fisio.nombres} {fisio.apellidos}
                    </Text>
                    <Text style={styles.doctorSede}>{fisio.sede}</Text>
                    <Text style={styles.doctorSpecialty}>{espPrincipal}</Text>
                  </View>
                </View>

                {/* Sección de Horarios estilo MiVeris */}
                <Text style={styles.horarioProximoLabel}>Horario más próximo:</Text>

                <View style={styles.horariosActionsRow}>
                  {/* Botón 1: Horario más próximo directo */}
                  {proximoHorario ? (
                    <PressableScale
                      onPress={() => handleConfirmarBloque(fisio, proximoHorario)}
                      hapticStyle="medium"
                      style={styles.proximoBtnWrapper}
                    >
                      <View style={styles.proximoBtn}>
                        <MaterialIcons name="schedule" size={16} color={THEME.colors.primary} />
                        <Text style={styles.proximoBtnText}>
                          {proximoHorario.horaInicio} - {proximoHorario.horaFin}
                        </Text>
                      </View>
                    </PressableScale>
                  ) : (
                    <View style={styles.sinHorarioBtn}>
                      <Text style={styles.sinHorarioText}>Sin turnos</Text>
                    </View>
                  )}

                  {/* Botón 2: Ver más horarios (despliega Modal / Bottom Sheet) */}
                  <PressableScale
                    onPress={() => handleAbrirMasHorarios(fisio)}
                    hapticStyle="medium"
                    style={styles.verMasBtnWrapper}
                  >
                    <View style={styles.verMasBtn}>
                      <Text style={styles.verMasBtnText}>Ver más horarios</Text>
                    </View>
                  </PressableScale>
                </View>
              </View>
            );
          }))}
        </View>
      </ScrollView>

      {/* Modal Deslizable de Horarios (Bottom Sheet como en Veris) */}
      <HorariosModal
        visible={modalHorariosVisible}
        fisioterapeuta={fisioterapeutaModal}
        fechaTexto={`${diaSeleccionado.diaSemana} ${diaSeleccionado.numeroDia} de ${diaSeleccionado.mesNombre}`}
        bloques={bloquesDelFisioModal}
        isLoading={loadingModalBloques}
        onSeleccionarBloque={(bloque) => {
          if (fisioterapeutaModal) {
            handleConfirmarBloque(fisioterapeutaModal, bloque);
          }
        }}
        onClose={() => setModalHorariosVisible(false)}
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
    marginBottom: 8,
  },
  btnAtrasText: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  pageMainTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F2820',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  verisNavyBanner: {
    backgroundColor: '#145340',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  chevronBtn: {
    padding: 4,
  },
  monthTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  dateCardsRow: {
    gap: 8,
    paddingHorizontal: 4,
  },
  verisDateCard: {
    width: 54,
    height: 74,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  verisDateCardContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verisDateCardInner: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verisDateCardSelected: {
    borderColor: '#1B6B53',
    backgroundColor: '#1B6B53',
    transform: [{ scale: 1.05 }],
  },
  verisHoyText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
    width: '100%',
  },
  verisHoyTextSelected: {
    color: '#FFFFFF',
  },
  verisDayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2820',
    textAlign: 'center',
    width: '100%',
  },
  verisDayTextSelected: {
    color: '#FFFFFF',
  },
  verisNumberText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F2820',
    marginTop: 2,
    textAlign: 'center',
    width: '100%',
  },
  verisNumberTextSelected: {
    color: '#FFFFFF',
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2820',
    marginBottom: 10,
  },
  filterPillsRow: {
    gap: 8,
    paddingBottom: 6,
  },
  filterPill: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  filterPillActive: {
    backgroundColor: '#1B6B53',
    borderColor: '#1B6B53',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2820',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  doctorsListSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 14,
  },
  doctorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...THEME.shadows.card,
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  doctorAvatarContainer: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: '#A7D7C8',
    padding: 2,
    marginRight: 14,
  },
  doctorAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2820',
    marginBottom: 2,
  },
  doctorSede: {
    fontSize: 12,
    color: '#1B6B53',
    fontWeight: '700',
    marginBottom: 1,
  },
  doctorSpecialty: {
    fontSize: 12,
    color: '#64748B',
  },
  horarioProximoLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B6B53',
    marginBottom: 8,
  },
  horariosActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  proximoBtnWrapper: {
    flex: 1,
  },
  proximoBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E8F5F1',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7D7C8',
  },
  proximoBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F2820',
    textAlign: 'center',
  },
  sinHorarioBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  sinHorarioText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  verMasBtnWrapper: {
    flex: 1,
  },
  verMasBtn: {
    width: '100%',
    backgroundColor: '#1B6B53',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verMasBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptyStateBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2820',
    textAlign: 'center',
  },
  emptyStateSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  retryBtn: {
    marginTop: 6,
    backgroundColor: '#1B6B53',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
