import { isAxiosError } from 'axios';
import {
  RegistroPacienteDTO,
  UserRole,
  UsuarioPaciente,
  ValidationError,
} from '../../core/domain';
import { IAuthRepository } from '../../core/ports';
import {
  apiClient,
  getAuthToken,
  getRefreshToken,
  removeAuthToken,
  saveTokens,
} from './client';
import { handleAxiosError } from './httpErrors';

interface UsuarioSesionDTO {
  id: string;
  email: string;
  nombres: string;
  apellidos: string;
  rol: UserRole;
  permisos: string[];
  debeCambiarPassword: boolean;
  fisioterapeutaId: string | null;
  pacienteId: string | null;
}

interface LoginRespuestaDTO {
  accessToken: string;
  expiraEn: number;
  usuario: UsuarioSesionDTO;
  refreshToken?: string;
}

interface PacienteDTO {
  id: string;
  cedula: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  sexo: string;
  telefono: string;
  email: string | null;
  direccion: string | null;
  contactoEmergenciaNombre: string | null;
  contactoEmergenciaTelefono: string | null;
  tieneCuenta: boolean;
  consentimientoVigente: boolean;
  creadoEn: string;
}

function mapToUsuarioPaciente(
  usuario: UsuarioSesionDTO,
  paciente: PacienteDTO | null
): UsuarioPaciente {
  return {
    id: paciente?.id ?? usuario.pacienteId ?? usuario.id,
    nombres: paciente?.nombres ?? usuario.nombres,
    apellidos: paciente?.apellidos ?? usuario.apellidos,
    cedula: paciente?.cedula ?? '',
    correo: paciente?.email ?? usuario.email,
    telefono: paciente?.telefono ?? '',
    fechaNacimiento: paciente?.fechaNacimiento ?? '',
    rol: usuario.rol,
    consentimientoLOPDP: paciente?.consentimientoVigente ?? false,
    fechaConsentimiento: paciente?.creadoEn,
  };
}

async function fetchPacientePerfilSeguro(): Promise<PacienteDTO | null> {
  try {
    const res = await apiClient.get<PacienteDTO>('/me/paciente');
    return res.data ?? null;
  } catch {
    return null;
  }
}

export class HttpAuthRepository implements IAuthRepository {
  async login(identificador: string, contrasena: string): Promise<UsuarioPaciente> {
    try {
      const response = await apiClient.post<LoginRespuestaDTO>('/auth/login', {
        identificador: identificador.trim().toLowerCase(),
        password: contrasena,
        cliente: 'movil',
      });

      const data = response.data;
      if (data.accessToken) {
        await saveTokens(data.accessToken, data.refreshToken);
      }

      const paciente = await fetchPacientePerfilSeguro();
      return mapToUsuarioPaciente(data.usuario, paciente);
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  async register(datos: RegistroPacienteDTO): Promise<UsuarioPaciente> {
    try {
      const payload = {
        cedula: datos.cedula.trim(),
        nombres: datos.nombres.trim(),
        apellidos: datos.apellidos.trim(),
        email: datos.correo.trim().toLowerCase(),
        telefono: datos.telefono.trim(),
        ...(datos.fechaNacimiento ? { fechaNacimiento: datos.fechaNacimiento.trim() } : {}),
        password: datos.contrasena,
        aceptaLopdp: datos.consentimientoLOPDP,
        ...(datos.expoPushToken ? { expoPushToken: datos.expoPushToken } : {}),
      };
      const response = await apiClient.post<LoginRespuestaDTO>('/auth/register', payload);
      const data = response.data;
      if (data.accessToken) {
        await saveTokens(data.accessToken, data.refreshToken);
      }
      const paciente = await fetchPacientePerfilSeguro();
      return mapToUsuarioPaciente(data.usuario, paciente);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        throw new ValidationError(
          'El alta inicial de pacientes se gestiona en recepción de Innova Fisioterapia.'
        );
      }
      return handleAxiosError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = await getRefreshToken();
      await apiClient
        .post('/auth/logout', refreshToken ? { refreshToken } : {})
        .catch(() => {
          // Ignorar si el backend ya cerró o invalidó la sesión
        });
    } finally {
      await removeAuthToken();
    }
  }

  async getMe(): Promise<UsuarioPaciente | null> {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        getAuthToken(),
        getRefreshToken(),
      ]);
      if (!accessToken && !refreshToken) {
        return null;
      }

      const [meRes, paciente] = await Promise.all([
        apiClient.get<UsuarioSesionDTO>('/auth/me'),
        fetchPacientePerfilSeguro(),
      ]);

      return mapToUsuarioPaciente(meRes.data, paciente);
    } catch {
      return null;
    }
  }
}
