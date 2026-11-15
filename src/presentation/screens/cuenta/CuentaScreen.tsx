import { MaterialIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
  Linking,
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
import { PressableScale } from '../../components/common/PressableScale';
import { THEME } from '../../theme/theme';
import { useAppointments } from '../../context/AppointmentContext';
import { useAuth } from '../../context/AuthContext';
import { CLINIC_INFO } from '../../../shared/constants/clinic';
import { DataSourceType, container } from '../../../infrastructure/container';

function calcularEdadTexto(fechaNacimiento?: string): string | null {
  if (!fechaNacimiento) return null;
  const nacimiento = new Date(fechaNacimiento);
  if (Number.isNaN(nacimiento.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad >= 0 && edad < 130 ? `${edad} años` : null;
}

export const CuentaScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { usuario, logout } = useAuth();
  const { recargarDatos } = useAppointments();
  const [modalLOPDPVisible, setModalLOPDPVisible] = useState(false);
  const [modalSedeVisible, setModalSedeVisible] = useState(false);
  const [dataSource, setDataSourceState] = useState<DataSourceType>(container.dataSource);

  const edadTexto = calcularEdadTexto(usuario?.fechaNacimiento);
  const metaParts = [
    edadTexto,
    usuario?.cedula ? `C.I. ${usuario.cedula}` : null,
  ].filter(Boolean);
  const userMetaTexto = metaParts.join('  |  ') || usuario?.correo || '';

  const handleCambiarOrigenDatos = () => {
    const next: DataSourceType = dataSource === 'mock' ? 'api' : 'mock';
    container.setDataSource(next);
    queryClient.clear();
    setDataSourceState(next);
    void recargarDatos();
    Alert.alert(
      'Fuente de Datos Conmutada',
      next === 'api'
        ? 'Modo HTTP API activado: la app consume los endpoints Axios (/turnos, /citas, /auth) para Node.js + PostgreSQL.'
        : 'Modo MOCK activado: la app consume datos locales estables para la defensa offline.'
    );
  };

  const handleCerrarSesion = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas salir de tu cuenta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const handleAbrirGoogleMaps = async () => {
    try {
      const supported = await Linking.canOpenURL(CLINIC_INFO.googleMapsUrl);
      if (supported) {
        await Linking.openURL(CLINIC_INFO.googleMapsUrl);
      } else {
        await Linking.openURL(CLINIC_INFO.googleMapsUrl);
      }
    } catch {
      Alert.alert(
        'Ubicación',
        'No se pudo abrir automáticamente Google Maps. Puedes buscar "Innova Fisioterapia Tumbaco" directamente en tu aplicación de mapas.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Hero Azul Institucional Estilo MiVeris */}
      <View
        style={[
          styles.verisHeroBlue,
          { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 24 : 12) + 10 },
        ]}
      >
        <Text style={styles.heroTitle}>Cuenta</Text>

        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <MaterialIcons name="person" size={54} color="#CBD5E1" />
          </View>
        </View>

        <Text style={styles.userName}>
          {usuario?.nombres} {usuario?.apellidos}
        </Text>
        {userMetaTexto ? <Text style={styles.userMeta}>{userMetaTexto}</Text> : null}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Tarjetas Superiores: Mis Datos / Expediente */}
        <View style={styles.quickActionsRow}>
          <PressableScale style={styles.quickCardWrapper} hapticStyle="light">
            <View style={styles.quickCard}>
              <View style={styles.quickIconBox}>
                <MaterialIcons name="person" size={24} color={THEME.colors.primary} />
              </View>
              <Text style={styles.quickCardText}>Mis datos</Text>
            </View>
          </PressableScale>

          <PressableScale style={styles.quickCardWrapper} hapticStyle="light">
            <View style={styles.quickCard}>
              <View style={styles.quickIconBox}>
                <MaterialIcons name="folder-shared" size={24} color={THEME.colors.primary} />
              </View>
              <Text style={styles.quickCardText}>Expediente</Text>
            </View>
          </PressableScale>
        </View>

        {/* Opciones de Cuenta Innova Fisioterapia */}
        <View style={styles.menuContainer}>
          {/* Sede Innova Fisioterapia */}
          <PressableScale onPress={() => setModalSedeVisible(true)} hapticStyle="light">
            <View style={styles.menuItem}>
              <View style={styles.menuIconBox}>
                <MaterialIcons name="location-on" size={24} color={THEME.colors.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Centro de Atención</Text>
                <Text style={styles.menuSub}>{CLINIC_INFO.direccion}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#94A3B8" />
            </View>
          </PressableScale>

          <View style={styles.divider} />

          {/* Privacidad LOPDP */}
          <PressableScale onPress={() => setModalLOPDPVisible(true)} hapticStyle="light">
            <View style={styles.menuItem}>
              <View style={styles.menuIconBox}>
                <MaterialIcons name="verified-user" size={24} color={THEME.colors.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Cumplimiento LOPDP Ecuador</Text>
                <Text style={styles.menuSub}>Consentimiento informado y cifrado AES-256</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#94A3B8" />
            </View>
          </PressableScale>

          <View style={styles.divider} />

          {/* Conmutador de Origen de Datos (Clean Architecture) */}
          <PressableScale onPress={handleCambiarOrigenDatos} hapticStyle="medium">
            <View style={styles.menuItem}>
              <View style={styles.menuIconBox}>
                <MaterialIcons name="settings-ethernet" size={24} color={THEME.colors.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Fuente de Datos (Clean Architecture)</Text>
                <Text style={styles.menuSub}>
                  {dataSource === 'api'
                    ? 'Modo HTTP API (Node.js + PostgreSQL)'
                    : 'Modo MOCK (Offline Tesis)'}
                </Text>
              </View>
              <MaterialIcons name="swap-horiz" size={22} color={THEME.colors.primary} />
            </View>
          </PressableScale>

          <View style={styles.divider} />

          {/* Preguntas Frecuentes */}
          <PressableScale hapticStyle="light">
            <View style={styles.menuItem}>
              <View style={styles.menuIconBox}>
                <MaterialIcons name="help-outline" size={24} color={THEME.colors.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Preguntas frecuentes</Text>
                <Text style={styles.menuSub}>Encuentra respuestas sobre citas y terapias</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#94A3B8" />
            </View>
          </PressableScale>
        </View>

        {/* Botón Cerrar Sesión Rojo MiVeris */}
        <TouchableOpacity
          style={styles.btnLogoutRow}
          onPress={handleCerrarSesion}
          activeOpacity={0.7}
        >
          <Text style={styles.btnLogoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>
          Innova Fisioterapia Móvil v1.0.0 • UCE 2026
        </Text>
      </ScrollView>

      {/* Modal LOPDP */}
      <Modal visible={modalLOPDPVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <MaterialIcons name="verified-user" size={24} color="#1B6B53" />
              <Text style={styles.modalHeaderTitle}>Protección de Datos Personales (LOPDP)</Text>
            </View>

            <ScrollView style={{ marginBottom: 16 }}>
              <Text style={styles.modalParrafo}>
                Conforme a la Ley Orgánica de Protección de Datos Personales del Ecuador (Registro Oficial 459, 2021):
              </Text>
              <Text style={styles.modalParrafo}>
                • Los datos de diagnóstico y escalas de dolor (EVA) están catalogados como datos sensibles de salud y se custodian bajo cifrado simétrico AES-256 en reposo.
              </Text>
              <Text style={styles.modalParrafo}>
                • El sistema no almacena medios de pago en línea, limitándose al registro administrativo presencial en recepción.
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.btnCerrarModal}
              onPress={() => setModalLOPDPVisible(false)}
            >
              <Text style={styles.btnCerrarModalText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Centro de Atención / Google Maps */}
      <Modal visible={modalSedeVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalSedeIconCircle}>
                <MaterialIcons name="location-on" size={22} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalHeaderTitle}>Centro de Atención</Text>
                <Text style={styles.modalHeaderSubtitle}>Innova Fisioterapia • Matriz</Text>
              </View>
            </View>

            <ScrollView style={{ marginBottom: 16 }} showsVerticalScrollIndicator={false}>
              {/* Tarjeta de Dirección */}
              <View style={styles.addressBox}>
                <Text style={styles.addressLabel}>DIRECCIÓN REAL Y EXACTA</Text>
                <Text style={styles.addressText}>
                  📍 Manuela Garaycoa y Norberto Salazar, Tumbaco 🇪🇨
                </Text>
                <Text style={styles.addressSubtext}>
                  Parroquia Tumbaco • Valle de Tumbaco, Quito - Ecuador
                </Text>
              </View>

              {/* Horarios */}
              <View style={styles.infoRowCard}>
                <MaterialIcons name="schedule" size={20} color="#1B6B53" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoRowTitle}>Horarios de Atención</Text>
                  <Text style={styles.infoRowText}>Lunes a Viernes: 07:00 – 19:00</Text>
                  <Text style={styles.infoRowText}>Sábados: 08:00 – 14:00</Text>
                </View>
              </View>

              {/* Modalidad de Pago Presencial */}
              <View style={styles.infoRowCard}>
                <MaterialIcons name="storefront" size={20} color="#1B6B53" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoRowTitle}>Recepción y Pago Presencial</Text>
                  <Text style={styles.infoRowText}>
                    Las sesiones se abonan de manera presencial en la recepción del centro al momento de tu turno.
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Botón Principal: Abrir en Google Maps */}
            <TouchableOpacity
              style={styles.btnGoogleMaps}
              onPress={handleAbrirGoogleMaps}
              activeOpacity={0.85}
            >
              <MaterialIcons name="navigation" size={20} color="#FFFFFF" />
              <Text style={styles.btnGoogleMapsText}>Abrir en Google Maps</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnCerrarModalSecundario}
              onPress={() => setModalSedeVisible(false)}
            >
              <Text style={styles.btnCerrarModalSecundarioText}>Cerrar</Text>
            </TouchableOpacity>
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
  verisHeroBlue: {
    backgroundColor: '#1B6B53',
    paddingHorizontal: 20,
    paddingBottom: 28,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  avatarContainer: {
    marginBottom: 10,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#145340',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userMeta: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: -16,
    marginBottom: 16,
    width: '100%',
  },
  quickCardWrapper: {
    flex: 1,
    width: '100%',
  },
  quickCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...THEME.shadows.card,
  },
  quickIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickCardText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2820',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...THEME.shadows.card,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuIconBox: {
    marginRight: 14,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2820',
  },
  menuSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  btnLogoutRow: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 12,
  },
  btnLogoutText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#EF4444',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 37, 72, 0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
    ...THEME.shadows.modal,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 12,
    marginBottom: 14,
  },
  modalSedeIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1B6B53',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2820',
  },
  modalHeaderSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1B6B53',
  },
  addressBox: {
    backgroundColor: '#E8F5F1',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#A7D7C8',
  },
  addressLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1B6B53',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2820',
    lineHeight: 20,
  },
  addressSubtext: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  infoRowCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoRowTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F2820',
    marginBottom: 2,
  },
  infoRowText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  modalParrafo: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 8,
  },
  btnGoogleMaps: {
    backgroundColor: '#1B6B53',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 10,
    marginBottom: 8,
    ...THEME.shadows.card,
  },
  btnGoogleMapsText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  btnCerrarModal: {
    backgroundColor: '#1B6B53',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnCerrarModalText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  btnCerrarModalSecundario: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnCerrarModalSecundarioText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 13,
  },
});
