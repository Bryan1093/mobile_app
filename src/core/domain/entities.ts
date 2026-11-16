export type UserRole = 'PACIENTE' | 'FISIOTERAPEUTA' | 'RECEPCIONISTA' | 'ADMINISTRADOR';

export interface UsuarioPaciente {
  id: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string;
  rol: UserRole;
  consentimientoLOPDP: boolean;
  fechaConsentimiento?: string;
  expoPushToken?: string;
}

// Alias de retrocompatibilidad
export type Usuario = UsuarioPaciente;

export interface Especialidad {
  id: string;
  nombre: string;
  descripcion: string;
  duracionMinutos: number; // 60 min regla fija clínica
  icono: string;
}

export interface Fisioterapeuta {
  id: string;
  nombres: string;
  apellidos: string;
  especialidad?: string;
  fotoUrl: string;
  registroProfesional: string;
  sede: string; // "Innova Fisioterapia - Tumbaco"
  especialidadesIds: string[]; // Relación N:N
  calificacion?: number;
}

export interface BloqueHorario {
  id: string;
  horaInicio: string; // ej. "09:00"
  horaFin: string;    // ej. "10:00"
  disponible: boolean;
  fisioterapeutaId: string;
  fecha: string;      // "YYYY-MM-DD"
  camillaId?: string;
  inicioIso?: string;
  finIso?: string;
}

export type EstadoCita = 'PROGRAMADA' | 'COMPLETADA' | 'CANCELADA' | 'EN_CURSO';

export interface Cita {
  id: string;
  pacienteId: string;
  pacienteNombreCompleto: string;
  fisioterapeutaId: string;
  fisioterapeutaNombreCompleto: string;
  especialidadId: string;
  especialidadNombre: string;
  sede: string; // "Innova Fisioterapia - Tumbaco"
  fecha: string; // "YYYY-MM-DD"
  horaInicio: string; // "10:00"
  horaFin: string; // "11:00"
  estado: EstadoCita;
  modalidadPago: 'PRESENCIAL_RECEPCION';
  estadoPago: 'PENDIENTE' | 'PAGADO';
  documentoPrescripcionUrl?: string;
  createdAt: string;
}

export type TipoDocumentoClinico =
  | 'RUTINA_EJERCICIOS'
  | 'RECOMENDACION_POSTURAL'
  | 'RECETA_MEDICA'
  | 'INFORME_EVOLUCION';

// Alias de retrocompatibilidad
export type TipoDocumento = TipoDocumentoClinico;

export interface EjercicioRutina {
  orden: number;
  nombre: string;
  zona: string;
  descripcion: string;
  series: number;
  repeticiones: number;
  frecuencia: string;
  notas: string | null;
}

export interface DocumentoClinico {
  id: string;
  pacienteId: string;
  fisioterapeutaNombre: string;
  titulo: string;
  tipo: TipoDocumentoClinico;
  fechaEmision: string; // "YYYY-MM-DD"
  archivoUrl: string; // URL o URI al PDF
  tamano: string;
  indicaciones?: string | null;
  activa?: boolean;
  ejercicios?: EjercicioRutina[];
}

// Alias de retrocompatibilidad
export type DocumentoMedico = DocumentoClinico;

export interface RegistroEva {
  id: string;
  pacienteId: string;
  fecha: string;
  nivelDolor: number; // 0 a 10 (Escala Visual Análoga)
  zonaAfectada: string;
  comentario?: string;
}

// Alias de retrocompatibilidad
export type RegistroEVA = RegistroEva;

export interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  tipo: 'RECORDATORIO_CITA' | 'NUEVO_DOCUMENTO' | 'SISTEMA';
  citaId?: string;
}

// DTOs de dominio
export interface LoginCredentialsDTO {
  identificador: string;
  contrasena: string;
}

export interface RegistroPacienteDTO {
  nombres: string;
  apellidos: string;
  cedula: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string;
  contrasena: string;
  consentimientoLOPDP: boolean;
  expoPushToken?: string;
}

export interface AgendarCitaDTO {
  pacienteId: string;
  pacienteNombre: string;
  especialidadId: string;
  especialidadNombre: string;
  fisioterapeutaId: string;
  fisioterapeutaNombre: string;
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaFin: string;    // HH:mm
  sede?: string;
  camillaId?: string;
  inicioIso?: string;
  notas?: string;
}

export interface ReservaParams {
  pacienteId: string;
  pacienteNombre: string;
  especialidad: Especialidad;
  fisioterapeuta: Fisioterapeuta;
  fecha: string;
  bloque: BloqueHorario;
}
