import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { THEME } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import {
  validarCedulaEcuatoriana,
  validarCorreo,
  validarTelefonoEcuador,
} from '../../../shared/utils/validators';

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { registro } = useAuth();

  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [cedula, setCedula] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [consentimientoLOPDP, setConsentimientoLOPDP] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleRegistro = async () => {
    // 1. Validaciones básicas
    if (!nombres.trim() || !apellidos.trim() || !cedula.trim() || !correo.trim() || !contrasena.trim()) {
      Alert.alert('Formulario incompleto', 'Por favor llena todos los campos obligatorios.');
      return;
    }

    // 2. Validación de Cédula mediante Módulo 10
    const valCedula = validarCedulaEcuatoriana(cedula);
    if (!valCedula.valida) {
      Alert.alert('Cédula no válida', valCedula.mensaje || 'Verifica el número de cédula ingresado.');
      return;
    }

    // 3. Validación de Correo
    if (!validarCorreo(correo)) {
      Alert.alert('Correo no válido', 'Ingresa una dirección de correo electrónico válida.');
      return;
    }

    // 4. Validación de Teléfono (opcional estricto para Ecuador)
    if (telefono.trim() && !validarTelefonoEcuador(telefono)) {
      Alert.alert('Teléfono incorrecto', 'El número celular debe tener 10 dígitos y empezar con 09.');
      return;
    }

    // 5. Consentimiento LOPDP obligatorio
    if (!consentimientoLOPDP) {
      Alert.alert(
        'Consentimiento Requerido',
        'Debes aceptar el tratamiento de datos personales de salud conforme a la Ley Orgánica de Protección de Datos Personales (LOPDP) del Ecuador.'
      );
      return;
    }

    setCargando(true);
    const res = await registro({
      nombres,
      apellidos,
      cedula,
      fechaNacimiento: fechaNacimiento.trim(),
      telefono: telefono.trim(),
      correo,
      contrasena,
      consentimientoLOPDP: true,
    });
    setCargando(false);

    if (!res.ok) {
      Alert.alert('Error en registro', res.mensaje || 'No se pudo crear la cuenta.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Cabecera */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <MaterialIcons name="arrow-back" size={24} color={THEME.colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Registro de Paciente</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Crea tu expediente</Text>
            <Text style={styles.formSub}>
              Registro clínico para autoservicio en Innova Fisioterapia
            </Text>

            {/* Nombres y Apellidos */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombres Completos *</Text>
              <TextInput
                style={styles.input}
                placeholder="ej. Juan Carlos"
                placeholderTextColor={THEME.colors.textMuted}
                value={nombres}
                onChangeText={setNombres}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Apellidos Completos *</Text>
              <TextInput
                style={styles.input}
                placeholder="ej. Pérez Morales"
                placeholderTextColor={THEME.colors.textMuted}
                value={apellidos}
                onChangeText={setApellidos}
              />
            </View>

            {/* Cédula Ecuatoriana (Módulo 10) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cédula de Identidad Ecuatoriana (10 dígitos) *</Text>
              <TextInput
                style={styles.input}
                placeholder="ej. 1725893412"
                placeholderTextColor={THEME.colors.textMuted}
                keyboardType="numeric"
                maxLength={10}
                value={cedula}
                onChangeText={setCedula}
              />
              <Text style={styles.inputHelp}>
                Validada con algoritmo oficial Módulo 10 del Registro Civil
              </Text>
            </View>

            {/* Fecha Nacimiento y Teléfono */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fecha de Nacimiento (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="ej. 1994-08-15"
                placeholderTextColor={THEME.colors.textMuted}
                value={fechaNacimiento}
                onChangeText={setFechaNacimiento}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teléfono Celular (Ecuador)</Text>
              <TextInput
                style={styles.input}
                placeholder="ej. 0998765432"
                placeholderTextColor={THEME.colors.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
                value={telefono}
                onChangeText={setTelefono}
              />
            </View>

            {/* Correo y Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo Electrónico *</Text>
              <TextInput
                style={styles.input}
                placeholder="paciente@ejemplo.com"
                placeholderTextColor={THEME.colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={correo}
                onChangeText={setCorreo}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña de Acceso *</Text>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={THEME.colors.textMuted}
                secureTextEntry
                value={contrasena}
                onChangeText={setContrasena}
              />
            </View>

            {/* Checkbox Obligatorio LOPDP */}
            <TouchableOpacity
              style={styles.consentimientoRow}
              onPress={() => setConsentimientoLOPDP(!consentimientoLOPDP)}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name={consentimientoLOPDP ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color={consentimientoLOPDP ? THEME.colors.primary : THEME.colors.textSecondary}
              />
              <Text style={styles.consentimientoText}>
                Otorgo mi <Text style={styles.bold}>Consentimiento Informado</Text> expreso para el
                tratamiento de mis datos de salud conforme a los artículos 7, 8 y 25 de la Ley
                Orgánica de Protección de Datos Personales (LOPDP) del Ecuador.
              </Text>
            </TouchableOpacity>

            {/* Botón de Registro */}
            <TouchableOpacity
              style={[styles.btnSubmit, cargando && styles.btnDisabled]}
              onPress={handleRegistro}
              disabled={cargando}
              activeOpacity={0.8}
            >
              {cargando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.btnSubmitText}>Registrar Paciente</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  formCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 20,
    ...THEME.shadows.card,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  formSub: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    marginBottom: 18,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    marginBottom: 5,
  },
  input: {
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 14,
    color: THEME.colors.textPrimary,
  },
  inputHelp: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
  consentimientoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 8,
    marginBottom: 18,
    padding: 10,
    backgroundColor: THEME.colors.primaryLight,
    borderRadius: THEME.borderRadius.sm,
  },
  consentimientoText: {
    flex: 1,
    fontSize: 12,
    color: THEME.colors.textPrimary,
    lineHeight: 17,
  },
  bold: {
    fontWeight: '700',
    color: THEME.colors.primaryDark,
  },
  btnSubmit: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 14,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnSubmitText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
