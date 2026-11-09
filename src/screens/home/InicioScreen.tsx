import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Image,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EvaScaleCard } from '../../components/EvaScaleCard';
import { NotificationsModal } from '../../components/NotificationsModal';
import { PressableScale } from '../../components/PressableScale';
import { THEME } from '../../constants/theme';
import { useAppointments } from '../../context/AppointmentContext';
import { useAuth } from '../../context/AuthContext';

export const InicioScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { usuario } = useAuth();
  const {
    citas,
    registrosEVA,
    notificaciones,
    contadorNotificacionesNoLeidas,
    marcarNotificacionesLeidas,
    recargarDatos,
  } = useAppointments();

  const [modalNotifVisible, setModalNotifVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Próxima cita activa
  const proximaCita = citas.find((c) => c.estado === 'PROGRAMADA');

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await recargarDatos();
    } finally {
      setRefreshing(false);
    }
  };

  const handleAbrirNotificaciones = () => {
    setModalNotifVisible(true);
    marcarNotificacionesLeidas();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Barra superior con logotipo oficial y campana */}
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 24 : 12) + 6 },
        ]}
      >
        <Image
          source={require('../../../assets/logo_innova.png')}
          style={styles.logoInnovaHeader}
          resizeMode="contain"
        />

        <PressableScale
          style={styles.bellButton}
          contentStyle={styles.bellContent}
          onPress={handleAbrirNotificaciones}
          hapticStyle="selection"
        >
          <MaterialIcons
            name="notifications-none"
            size={22}
            color="#0F2820"
            style={{ textAlign: 'center' }}
          />
          {contadorNotificacionesNoLeidas > 0 && (
            <View style={styles.badgeCount}>
              <Text style={styles.badgeCountText}>{contadorNotificacionesNoLeidas}</Text>
            </View>
          )}
        </PressableScale>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Saludo Personalizado Estilo MiVeris */}
        <View style={styles.saludoContainer}>
          <Text style={styles.saludoPequeno}>Buenas tardes,</Text>
          <Text style={styles.saludoGrande}>{usuario?.nombres.split(' ')[0] || 'Brayan'}.</Text>
        </View>
        {/* Tarjeta Destacada con Degradado Verde Esmeralda Innova */}
        <LinearGradient
          colors={['#0B382B', '#145340', '#1B6B53']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.proximaCitaCard}
        >
          <View style={styles.proximaHeaderRow}>
            <View style={styles.proximaIconBox}>
              <MaterialIcons name="calendar-today" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.proximaTitle}>Tu Próxima Cita</Text>
          </View>

          {proximaCita ? (
            <View style={styles.proximaBody}>
              <Text style={styles.proximaEspecialidad}>{proximaCita.especialidadNombre}</Text>
              <View style={styles.proximaMetaRow}>
                <MaterialIcons name="schedule" size={16} color="rgba(255, 255, 255, 0.85)" />
                <Text style={styles.proximaMetaText}>
                  {proximaCita.fecha} • {proximaCita.horaInicio} a {proximaCita.horaFin}
                </Text>
              </View>
              <View style={styles.proximaMetaRow}>
                <MaterialIcons name="person" size={16} color="rgba(255, 255, 255, 0.85)" />
                <Text style={styles.proximaMetaText}>{proximaCita.fisioterapeutaNombreCompleto}</Text>
              </View>

              <PressableScale
                onPress={() => navigation.navigate('CitasTab')}
                hapticStyle="light"
                style={styles.proximaBtnWrapper}
              >
                <View style={styles.proximaBtn}>
                  <Text style={styles.proximaBtnText}>Ver detalles de la agenda</Text>
                  <MaterialIcons name="arrow-forward" size={16} color={THEME.colors.primary} />
                </View>
              </PressableScale>
            </View>
          ) : (
            <View style={styles.sinCitaBody}>
              <Text style={styles.sinCitaText}>No tienes turnos programados en este momento.</Text>
              <PressableScale
                onPress={() =>
                  navigation.navigate('CitasTab', {
                    screen: 'SeleccionHorario',
                  })
                }
                hapticStyle="medium"
              >
                <View style={styles.agendarAhoraBtn}>
                  <MaterialIcons name="add-circle-outline" size={18} color={THEME.colors.primary} />
                  <Text style={styles.agendarAhoraText}>Agendar Nueva Cita</Text>
                </View>
              </PressableScale>
            </View>
          )}
        </LinearGradient>

        {/* Acceso rápido táctil con rebote elástico */}
        <View style={styles.accesosRapidosRow}>
          <PressableScale
            style={styles.accesoCardWrapper}
            onPress={() => navigation.navigate('CitasTab', { screen: 'SeleccionHorario' })}
            hapticStyle="medium"
          >
            <View style={styles.accesoCard}>
              <View style={[styles.accesoIconBox, { backgroundColor: '#E0E7FF' }]}>
                <MaterialIcons name="add-alarm" size={24} color="#4338CA" />
              </View>
              <Text style={styles.accesoTitle}>Nuevo Turno</Text>
              <Text style={styles.accesoSub}>Elegir fecha y doctor</Text>
            </View>
          </PressableScale>

          <PressableScale
            style={styles.accesoCardWrapper}
            onPress={() => navigation.navigate('TratamientosTab')}
            hapticStyle="medium"
          >
            <View style={styles.accesoCard}>
              <View style={[styles.accesoIconBox, { backgroundColor: '#DCFCE7' }]}>
                <MaterialIcons name="description" size={24} color="#15803D" />
              </View>
              <Text style={styles.accesoTitle}>Mis Rutinas</Text>
              <Text style={styles.accesoSub}>Ejercicios en PDF</Text>
            </View>
          </PressableScale>
        </View>

        {/* Componente Escala Visual Análoga (EVA) de dolor con respuesta háptica */}
        <EvaScaleCard registros={registrosEVA} />

        {/* Información de la Sede Innova Fisioterapia */}
        <View style={styles.sedeCard}>
          <View style={styles.sedeHeader}>
            <MaterialIcons name="medical-information" size={20} color={THEME.colors.primary} />
            <Text style={styles.sedeTitle}>Innova Fisioterapia • Sede Matriz</Text>
          </View>
          <Text style={styles.sedeInfo}>
            📍 Manuela Garaycoa y Norberto Salazar, Tumbaco 🇪🇨
          </Text>
          <Text style={styles.sedeInfo}>
            🕒 Lunes a Viernes: 07:00 a 19:00 | Sábados: 08:00 a 14:00
          </Text>
          <Text style={styles.sedeNota}>
            Control concurrente de citas y custodia de datos de salud conforme a la Ley Orgánica de Protección de Datos Personales (LOPDP).
          </Text>
        </View>
      </ScrollView>

      {/* Modal de Notificaciones */}
      <NotificationsModal
        visible={modalNotifVisible}
        notificaciones={notificaciones}
        onClose={() => setModalNotifVisible(false)}
        onMarcarLeidas={marcarNotificacionesLeidas}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  logoInnovaHeader: {
    width: 170,
    height: 44,
  },
  saludoContainer: {
    marginBottom: 16,
  },
  saludoPequeno: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F2820',
  },
  saludoGrande: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F2820',
  },
  bellButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeCount: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: THEME.colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  proximaCitaCard: {
    borderRadius: THEME.borderRadius.md,
    padding: 18,
    marginBottom: 16,
    ...THEME.shadows.card,
  },
  proximaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  proximaIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proximaTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.95)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  proximaBody: {
    gap: 6,
  },
  proximaEspecialidad: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  proximaMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  proximaMetaText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  proximaBtnWrapper: {
    marginTop: 12,
  },
  proximaBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: THEME.borderRadius.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    ...THEME.shadows.card,
  },
  proximaBtnText: {
    color: THEME.colors.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  sinCitaBody: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  sinCitaText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  agendarAhoraBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: THEME.borderRadius.sm,
    ...THEME.shadows.card,
  },
  agendarAhoraText: {
    color: THEME.colors.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  accesosRapidosRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    width: '100%',
  },
  accesoCardWrapper: {
    flex: 1,
    width: '100%',
  },
  accesoCard: {
    width: '100%',
    backgroundColor: THEME.colors.surface,
    padding: 16,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    ...THEME.shadows.card,
  },
  accesoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  accesoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  accesoSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  sedeCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    ...THEME.shadows.card,
  },
  sedeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sedeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  sedeInfo: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 4,
    lineHeight: 18,
  },
  sedeNota: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderLight,
    paddingTop: 6,
  },
});
