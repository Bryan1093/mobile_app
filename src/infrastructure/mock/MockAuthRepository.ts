import { getAuthToken, removeAuthToken, saveAuthToken } from '../../api/client';
import { RegistroPacienteDTO, UsuarioPaciente, ValidationError } from '../../core/domain';
import { IAuthRepository } from '../../core/ports';
import { PACIENTE_ACTUAL_MOCK } from '../../data/mockData';

export class MockAuthRepository implements IAuthRepository {
  private currentUser: UsuarioPaciente | null = PACIENTE_ACTUAL_MOCK;

  async login(identificador: string, contrasena: string): Promise<UsuarioPaciente> {
    // Simular latencia de red realista
    await new Promise((res) => setTimeout(res, 500));

    if (!identificador.trim() || !contrasena.trim()) {
      throw new ValidationError('El identificador y la contraseña son requeridos.');
    }

    // Permitir cualquier clave en modo mock para facilitar pruebas de defensa
    const token = `mock-jwt-lopdp-${Date.now()}`;
    await saveAuthToken(token);
    this.currentUser = {
      ...PACIENTE_ACTUAL_MOCK,
      cedula: identificador.includes('@') ? PACIENTE_ACTUAL_MOCK.cedula : identificador,
      correo: identificador.includes('@') ? identificador : PACIENTE_ACTUAL_MOCK.correo,
    };
    return this.currentUser;
  }

  async register(datos: RegistroPacienteDTO): Promise<UsuarioPaciente> {
    await new Promise((res) => setTimeout(res, 600));

    if (!datos.consentimientoLOPDP) {
      throw new ValidationError('Debe aceptar el consentimiento LOPDP para continuar.');
    }

    const nuevoUsuario: UsuarioPaciente = {
      id: `pac-${datos.cedula}`,
      nombres: datos.nombres,
      apellidos: datos.apellidos,
      cedula: datos.cedula,
      correo: datos.correo,
      telefono: datos.telefono,
      fechaNacimiento: datos.fechaNacimiento,
      rol: 'PACIENTE',
      consentimientoLOPDP: true,
      fechaConsentimiento: new Date().toISOString(),
      expoPushToken: datos.expoPushToken || 'ExponentPushToken[mock-paciente]',
    };

    const token = `mock-jwt-lopdp-${Date.now()}`;
    await saveAuthToken(token);
    this.currentUser = nuevoUsuario;
    return nuevoUsuario;
  }

  async logout(): Promise<void> {
    await removeAuthToken();
    this.currentUser = null;
  }

  async getMe(): Promise<UsuarioPaciente | null> {
    const token = await getAuthToken();
    if (!token && !this.currentUser) {
      return null;
    }
    // Si hay token o sesión en memoria, retornamos usuario mock
    return this.currentUser || PACIENTE_ACTUAL_MOCK;
  }
}
