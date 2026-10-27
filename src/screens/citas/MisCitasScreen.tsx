import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CitaCard } from '../../components/CitaCard';
import { PressableScale } from '../../components/PressableScale';
import { THEME } from '../../constants/theme';
import { useAppointments } from '../../context/AppointmentContext';
import { Cita } from '../../types';

export const MisCitasScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { citas, cancelarCita } = useAppointments();

  // Modal para ver lista de citas (Próximas o Historial)
  const [modalListaVisible, setModalListaVisible] = useState(false);
  const [tipoLista, setTipoLista] = useState<'PROXIMAS' | 'HISTORIAL'>('PROXIMAS');

  const citasFiltradas = citas.filter((cita) => {
    if (tipoLista === 'PROXIMAS') {
      return cita.estado === 'PROGRAMADA' || cita.estado === 'EN_CURSO';
    } else {
      return cita.estado === 'COMPLETADA' || cita.estado === 'CANCELADA';
    }
  });

  const handleAbrirLista = (tipo: 'PROXIMAS' | 'HISTORIAL') => {
    setTipoLista(tipo);
    setModalListaVisible(true);
  };

  const handleReagendar = (cita: Cita) => {
    setModalListaVisible(false);
    navigation.navigate('SeleccionHorario', {
      especialidadIdPrevia: cita.especialidadId,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Cabecera Estilo MiVeris */}
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
        <Text style={styles.pageMainTitle}>Citas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Sección: Servicios con barra vertical azul */}
        <View style={styles.sectionTitleRow}>
          <View style={styles.blueVerticalBar} />
          <Text style={styles.sectionTitle}>Servicios de Fisioterapia</Text>
        </View>

        {/* Grilla 2x3 de servicios como en Veris */}
        <View style={styles.gridServicios}>
          {[
            {
              id: 'esp-2',
              title: 'Terapia física y deportiva',
              icon: 'sports-gymnastics' as const,
              bgCircle: '#E0F2FE',
            },
            {
              id: 'esp-1',
              title: 'Rehabilitación traumatológica',
              icon: 'accessibility-new' as const,
              bgCircle: '#DCFCE7',
            },
            {
              id: 'esp-3',
              title: 'Fisioterapia neurológica',
              icon: 'psychology' as const,
              bgCircle: '#F3E8FF',
            },
            {
              id: 'esp-5',
              title: 'Terapia manual y punción',
              icon: 'healing' as const,
              bgCircle: '#E0E7FF',
            },
            {
              id: 'esp-4',
              title: 'Reumatológica y geriátrica',
              icon: 'elderly' as const,
              bgCircle: '#FCE7F3',
            },
            {
              id: 'TODAS',
              title: 'Evaluación funcional general',
              icon: 'assignment' as const,
              bgCircle: '#FEF3C7',
            },
          ].map((item) => (
            <PressableScale
              key={item.id}
              onPress={() =>
                navigation.navigate('SeleccionHorario', {
                  especialidadIdPrevia: item.id !== 'TODAS' ? item.id : undefined,
                })
              }
              hapticStyle="light"
              style={styles.servicioCardWrapper}
            >
              <View style={styles.servicioCard}>
                <Text style={styles.servicioCardTitle}>{item.title}</Text>
                <View style={[styles.semiCircleBox, { backgroundColor: item.bgCircle }]}>
                  <MaterialIcons name={item.icon} size={28} color="#002855" />
                </View>
              </View>
            </PressableScale>
          ))}
        </View>

        {/* Sección: Mis Citas con barra vertical azul */}
        <View style={[styles.sectionTitleRow, { marginTop: 20 }]}>
          <View style={styles.blueVerticalBar} />
          <Text style={styles.sectionTitle}>Mis citas</Text>
        </View>

        <View style={styles.gridMisCitas}>
          {/* Card: Próximas Citas */}
          <PressableScale
            onPress={() => handleAbrirLista('PROXIMAS')}
            hapticStyle="medium"
            style={styles.misCitasCardWrapper}
          >
            <View style={styles.misCitasCard}>
              <View>
                <Text style={styles.misCitasCardTitle}>Próximas citas</Text>
                <Text style={styles.misCitasCardSub}>Ver turnos activos</Text>
              </View>
              <View style={[styles.semiCircleBox, { backgroundColor: '#E0F2FE' }]}>
                <MaterialIcons name="event" size={28} color="#0052CC" />
              </View>
            </View>
          </PressableScale>

          {/* Card: Historial de Citas */}
          <PressableScale
            onPress={() => handleAbrirLista('HISTORIAL')}
            hapticStyle="medium"
            style={styles.misCitasCardWrapper}
          >
            <View style={styles.misCitasCard}>
              <View>
                <Text style={styles.misCitasCardTitle}>Historial de citas</Text>
                <Text style={styles.misCitasCardSub}>Sesiones pasadas</Text>
              </View>
              <View style={[styles.semiCircleBox, { backgroundColor: '#F1F5F9' }]}>
                <MaterialIcons name="history" size={28} color="#475569" />
              </View>
            </View>
          </PressableScale>
        </View>
      </ScrollView>

      {/* Modal con la Lista de Citas (Próximas o Historial) */}
      <Modal visible={modalListaVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {tipoLista === 'PROXIMAS' ? 'Próximas Citas' : 'Historial de Citas'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalListaVisible(false)}
                style={styles.modalCloseBtn}
              >
                <MaterialIcons name="close" size={24} color="#002855" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={citasFiltradas}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <CitaCard
                  cita={item}
                  onCancelar={cancelarCita}
                  onReagendar={handleReagendar}
                />
              )}
              ListEmptyComponent={
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <MaterialIcons name="event-busy" size={48} color={THEME.colors.textMuted} />
                  <Text style={{ marginTop: 8, color: THEME.colors.textMuted, fontSize: 14 }}>
                    No tienes citas en esta lista.
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
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
    color: '#1B6B53',
  },
  pageMainTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F2820',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  blueVerticalBar: {
    width: 4,
    height: 20,
    backgroundColor: '#1B6B53',
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F2820',
  },
  gridServicios: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  servicioCardWrapper: {
    width: '48%',
  },
  servicioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 105,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    ...THEME.shadows.card,
  },
  servicioCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#002855',
    lineHeight: 17,
    maxWidth: '65%',
  },
  semiCircleBox: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridMisCitas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  misCitasCardWrapper: {
    flex: 1,
  },
  misCitasCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 100,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    ...THEME.shadows.card,
  },
  misCitasCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#002855',
  },
  misCitasCardSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 37, 72, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: '50%',
    ...THEME.shadows.modal,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#002855',
  },
  modalCloseBtn: {
    padding: 4,
  },
});
