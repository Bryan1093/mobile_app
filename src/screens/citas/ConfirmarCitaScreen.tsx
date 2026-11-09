import { MaterialIcons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConflictModal } from '../../components/ConflictModal';
import { PressableScale } from '../../components/PressableScale';
import { THEME } from '../../constants/theme';
import { useAppointments } from '../../context/AppointmentContext';
import { useAuth } from '../../context/AuthContext';
import { PRECIO_SESION, SEDE_UNICA } from '../../data/mockData';
import { CitasStackParamList } from '../../types';

export const ConfirmarCitaScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<CitasStackParamList, 'ConfirmarCita'>>();
  const { especialidad, fisioterapeuta, fecha, bloqueHorario } = route.params;

  const { usuario } = useAuth();
  const { agendarCita, conflictModalVisible, setConflictModalVisible } = useAppointments();
  const [procesando, setProcesando] = useState(false);

  // Formato de fecha dd/mm/yyyy
  const [ano, mes, dia] = fecha.split('-');
  const fechaFormateada = `${dia}/${mes}/${ano}`;

  const handleConfirmar = async () => {
    if (!usuario) {
      Alert.alert('Sesión requerida', 'Debes iniciar sesión para confirmar tu turno.');
      return;
    }

    setProcesando(true);
    try {
      const resultado = await agendarCita({
        pacienteId: usuario.id,
        pacienteNombre: `${usuario.nombres} ${usuario.apellidos}`,
        especialidad,
        fisioterapeuta,
        fecha,
        bloque: bloqueHorario,
      });

      if (resultado.success) {
        Alert.alert(
          '¡Cita Agendada Exitosamente!',
          `Tu turno para ${especialidad.nombre} ha sido reservado para el ${fechaFormateada} de ${bloqueHorario.horaInicio} a ${bloqueHorario.horaFin} en ${SEDE_UNICA}.`,
          [
            {
              text: 'Ver mis citas',
              onPress: () => navigation.navigate('MisCitas'),
            },
          ]
        );
      }
    } catch {
      Alert.alert('Error', 'No se pudo procesar la solicitud.');
    } finally {
      setProcesando(false);
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
        <Text style={styles.pageMainTitle}>Revisa tus datos</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Tarjeta 1: Costo de la Sesión y Modalidad de Pago Presencial */}
        <View style={styles.card}>
          <View style={styles.cardHeaderLight}>
            <Text style={styles.cardHeaderTitle}>Valor de la Sesión</Text>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.precioGrande}>{PRECIO_SESION}</Text>

            <View style={styles.pagoPresencialBox}>
              <View style={styles.pagoPresencialHeader}>
                <MaterialIcons name="storefront" size={20} color="#0052CC" />
                <Text style={styles.pagoPresencialTitle}>Pago Presencial en Recepción</Text>
              </View>
              <Text style={styles.pagoPresencialDesc}>
                Sin pagos ni pasarelas electrónicas. Cancelas directamente el día de tu terapia al presentarte en Innova Fisioterapia (Tumbaco).
              </Text>
            </View>
          </View>
        </View>

        {/* Tarjeta 2: Detalles de la Cita Médica */}
        <View style={styles.card}>
          <View style={styles.cardHeaderLight}>
            <Text style={styles.cardHeaderTitle}>Detalles de la cita</Text>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.detalleEspecialidad}>{especialidad.nombre}</Text>
            <Text style={styles.detalleSede}>
              <MaterialIcons name="location-on" size={14} color="#0052CC" /> {SEDE_UNICA}
            </Text>

            <View style={styles.metaRow}>
              <MaterialIcons name="calendar-today" size={16} color="#0052CC" />
              <Text style={styles.metaLabel}>Fecha y horario:</Text>
              <Text style={styles.metaValue}>
                {fechaFormateada}  ({bloqueHorario.horaInicio} - {bloqueHorario.horaFin})
              </Text>
            </View>

            <View style={styles.metaRow}>
              <MaterialIcons name="person" size={16} color="#0052CC" />
              <Text style={styles.metaLabel}>Fisioterapeuta:</Text>
              <Text style={styles.metaValue}>
                Lcdo. {fisioterapeuta.nombres} {fisioterapeuta.apellidos}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <MaterialIcons name="badge" size={16} color="#0052CC" />
              <Text style={styles.metaLabel}>Paciente:</Text>
              <Text style={styles.metaValue}>
                {usuario?.nombres} {usuario?.apellidos}
              </Text>
            </View>

            <View style={styles.dividerThin} />

            {/* Aviso informativo de reagendamiento */}
            <View style={styles.avisoBox}>
              <View style={styles.infoCircleIcon}>
                <MaterialIcons name="info" size={18} color="#0052CC" />
              </View>
              <Text style={styles.avisoText}>
                Puedes reagendar o cancelar tu cita con anticipación desde la app móvil sin penalizaciones.
              </Text>
            </View>
          </View>
        </View>

        {/* Garantía Transaccional de Concurrencia (Tesis UCE) */}
        <View style={styles.garantiaCard}>
          <MaterialIcons name="verified-user" size={18} color={THEME.colors.success} />
          <Text style={styles.garantiaText}>
            Reserva protegida por transacciones ACID con bloqueos a nivel de fila (SELECT FOR UPDATE) en PostgreSQL para evitar duplicidad de camillas.
          </Text>
        </View>
      </ScrollView>

      {/* Botón Fijo Inferior */}
      <View style={styles.footerFixed}>
        <PressableScale
          onPress={handleConfirmar}
          disabled={procesando}
          hapticStyle="success"
          style={styles.btnConfirmarWrapper}
        >
          <View style={[styles.btnConfirmar, procesando && styles.btnDisabled]}>
            {procesando ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.btnConfirmarText}>Confirmar Cita</Text>
            )}
          </View>
        </PressableScale>
      </View>

      {/* Modal de Concurrencia 409 Conflict */}
      <ConflictModal
        visible={conflictModalVisible}
        onClose={() => {
          setConflictModalVisible(false);
          navigation.goBack();
        }}
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
    color: '#002855',
  },
  pageMainTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#002855',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...THEME.shadows.card,
  },
  cardHeaderLight: {
    backgroundColor: '#E8F5F1',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#145340',
  },
  cardBody: {
    padding: 18,
  },
  precioGrande: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1B6B53',
    textAlign: 'center',
    marginBottom: 12,
  },
  pagoPresencialBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#A7D7C8',
    borderRadius: 10,
    padding: 12,
  },
  pagoPresencialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  pagoPresencialTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#145340',
  },
  pagoPresencialDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  detalleEspecialidad: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1B6B53',
    marginBottom: 4,
  },
  detalleSede: {
    fontSize: 13,
    fontWeight: '700',
    color: '#145340',
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 13,
    color: '#0F2820',
    fontWeight: '700',
    flexShrink: 1,
  },
  dividerThin: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginVertical: 12,
  },
  avisoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
  },
  infoCircleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F5F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avisoText: {
    fontSize: 12,
    color: '#145340',
    fontWeight: '500',
    flex: 1,
    lineHeight: 17,
  },
  garantiaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  garantiaText: {
    fontSize: 11,
    color: '#065F46',
    flex: 1,
    lineHeight: 16,
  },
  footerFixed: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    ...THEME.shadows.modal,
  },
  btnConfirmarWrapper: {
    width: '100%',
  },
  btnConfirmar: {
    backgroundColor: '#1B6B53',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnConfirmarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
