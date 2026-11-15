import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { container } from '../../../infrastructure/container';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { login } = useAuth();

  const [identificador, setIdentificador] = useState(
    container.dataSource === 'mock' ? '1725893412' : ''
  );
  const [contrasena, setContrasena] = useState(
    container.dataSource === 'mock' ? 'password123' : ''
  );
  const [cargando, setCargando] = useState(false);
  const [mostrarPass, setMostrarPass] = useState(false);

  const handleLogin = async () => {
    if (!identificador.trim() || !contrasena.trim()) {
      Alert.alert('Campos incompletos', 'Ingresa tu número de cédula o correo y tu contraseña.');
      return;
    }

    setCargando(true);
    const res = await login(identificador, contrasena);
    setCargando(false);

    if (!res.ok) {
      Alert.alert('Acceso fallido', res.mensaje || 'Credenciales incorrectas.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Cabecera Gráfica con Logotipo Oficial */}
          <View style={styles.heroSection}>
            <View style={styles.logoBoxLogin}>
              <Image
                source={require('../../../../assets/logo_innova.png')}
                style={styles.logoImageLogin}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.brandSubtitle}>Centro de Rehabilitación Física • Tumbaco</Text>
          </View>

          {/* Formulario */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Portal de Pacientes</Text>
            <Text style={styles.formSub}>Gestiona tus citas y tratamientos en línea</Text>

            {/* Input Cédula o Correo */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cédula o Correo Electrónico</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="badge" size={20} color={THEME.colors.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="ej. 1725893412 o paciente@email.com"
                  placeholderTextColor={THEME.colors.textMuted}
                  value={identificador}
                  onChangeText={setIdentificador}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Input Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock-outline" size={20} color={THEME.colors.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={THEME.colors.textMuted}
                  secureTextEntry={!mostrarPass}
                  value={contrasena}
                  onChangeText={setContrasena}
                />
                <TouchableOpacity onPress={() => setMostrarPass(!mostrarPass)}>
                  <MaterialIcons
                    name={mostrarPass ? 'visibility-off' : 'visibility'}
                    size={20}
                    color={THEME.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Botón Ingresar */}
            <TouchableOpacity
              style={[styles.btnLogin, cargando && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={cargando}
              activeOpacity={0.8}
            >
              {cargando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.btnLoginText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>

            {/* Separador */}
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>¿Eres nuevo paciente?</Text>
              <View style={styles.divider} />
            </View>

            {/* Botón Registrarse */}
            <TouchableOpacity
              style={styles.btnRegister}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.8}
            >
              <Text style={styles.btnRegisterText}>Crear cuenta de paciente</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.lopdpFooter}>
            🔒 Plataforma protegida conforme a la Ley Orgánica de Protección de Datos Personales (LOPDP) del Ecuador.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: THEME.colors.background,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 10,
  },
  logoBoxLogin: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 10,
    ...THEME.shadows.card,
  },
  logoImageLogin: {
    width: 220,
    height: 56,
  },
  brandSubtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 24,
    ...THEME.shadows.card,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  formSub: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: THEME.colors.textPrimary,
  },
  btnLogin: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 14,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnLoginText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.colors.border,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: THEME.colors.textMuted,
  },
  btnRegister: {
    borderWidth: 1.5,
    borderColor: THEME.colors.primary,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  btnRegisterText: {
    color: THEME.colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  lopdpFooter: {
    textAlign: 'center',
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 24,
    lineHeight: 16,
  },
});
