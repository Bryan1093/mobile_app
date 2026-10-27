export type UserRole = 'PACIENTE' | 'FISIOTERAPEUTA' | 'RECEPCIONISTA' | 'ADMINISTRADOR';

export interface Usuario {
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

export interface Especialidad {
  id: string;
  nombre: string;
  descripcion: string;
  duracionMinutos: number; // 60 min según regla de negocio
  icono: string;
}

export interface Fisioterapeuta {
  id: string;
  nombres: string;
  apellidos: string;
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

export type TipoDocumento = 'RUTINA_EJERCICIOS' | 'RECOMENDACION_POSTURAL' | 'RECETA_MEDICA' | 'INFORME_EVOLUCION';

export interface DocumentoMedico {
  id: string;
  pacienteId: string;
  fisioterapeutaNombre: string;
  titulo: string;
  tipo: TipoDocumento;
  fechaEmision: string; // "YYYY-MM-DD"
  archivoUrl: string; // URL al PDF (o local asset)
  tamano: string;
}

export interface RegistroEVA {
  id: string;
  pacienteId: string;
  fecha: string;
  nivelDolor: number; // 0 a 10 (Escala Visual Análoga)
  zonaAfectada: string;
  comentario?: string;
}

export interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  tipo: 'RECORDATORIO_CITA' | 'NUEVO_DOCUMENTO' | 'SISTEMA';
  citaId?: string;
}

// Parámetros de navegación
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type CitasStackParamList = {
  MisCitas: undefined;
  SeleccionHorario: { especialidadIdPrevia?: string };
  ConfirmarCita: {
    especialidad: Especialidad;
    fisioterapeuta: Fisioterapeuta;
    fecha: string;
    bloqueHorario: BloqueHorario;
  };
};

export type MainTabParamList = {
  InicioTab: undefined;
  CitasTab: undefined;
  TratamientosTab: undefined;
  CuentaTab: undefined;
};

