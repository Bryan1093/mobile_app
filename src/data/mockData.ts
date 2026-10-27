import { Cita, DocumentoMedico, Especialidad, Fisioterapeuta, Notificacion, RegistroEVA, Usuario } from '../types';

export const SEDE_UNICA = 'Innova Fisioterapia - Tumbaco';
export const DIRECCION_SEDE = 'Manuela Garaycoa y Norberto Salazar, Tumbaco';
export const GOOGLE_MAPS_SEDE_URL =
  'https://www.google.com/maps?cid=15082880730096735769&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAMYASAF&hl=es-ES&source=embed';
export const PRECIO_SESION = '$25.00';

export const ESPECIALIDADES_MOCK: Especialidad[] = [
  {
    id: 'esp-1',
    nombre: 'Fisioterapia Traumatológica',
    descripcion: 'Rehabilitación postquirúrgica, fracturas, esguinces y dolor articular crónico.',
    duracionMinutos: 60,
    icono: 'fitness-center',
  },
  {
    id: 'esp-2',
    nombre: 'Fisioterapia Deportiva',
    descripcion: 'Recuperación de desgarros, tendinopatías y readaptación funcional deportiva.',
    duracionMinutos: 60,
    icono: 'sports-gymnastics',
  },
  {
    id: 'esp-3',
    nombre: 'Fisioterapia Neurológica',
    descripcion: 'Tratamiento de secuelas cerebrovasculares, paresias y reeducación de marcha.',
    duracionMinutos: 60,
    icono: 'psychology',
  },
  {
    id: 'esp-4',
    nombre: 'Fisioterapia Reumatológica',
    descripcion: 'Alivio del dolor en artritis, artrosis, fibromialgia y rigidez articular.',
    duracionMinutos: 60,
    icono: 'healing',
  },
  {
    id: 'esp-5',
    nombre: 'Terapia Manual y Punción Seca',
    descripcion: 'Liberación miofascial profunda, puntos gatillo y movilización vertebral.',
    duracionMinutos: 60,
    icono: 'medical-services',
  },
];

export const FISIOTERAPEUTAS_MOCK: Fisioterapeuta[] = [
  {
    id: 'fis-1',
    nombres: 'Bryan Eduardo',
    apellidos: 'Loya Cadena',
    registroProfesional: 'SENESCYT-1005-2023-F01',
    sede: SEDE_UNICA,
    fotoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
    especialidadesIds: ['esp-1', 'esp-2', 'esp-5'],
    calificacion: 4.9,
  },
  {
    id: 'fis-2',
    nombres: 'Kevin Fernando',
    apellidos: 'Pozo Maldonado',
    registroProfesional: 'SENESCYT-1005-2023-F02',
    sede: SEDE_UNICA,
    fotoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80',
    especialidadesIds: ['esp-1', 'esp-2', 'esp-3'],
    calificacion: 4.9,
  },
  {
    id: 'fis-3',
    nombres: 'Andrea María',
    apellidos: 'Morales Silva',
    registroProfesional: 'SENESCYT-1005-2022-F03',
    sede: SEDE_UNICA,
    fotoUrl: 'https://images.unsplash.com/photo-1594824813583-e18e692cf5d6?w=300&auto=format&fit=crop&q=80',
    especialidadesIds: ['esp-3', 'esp-4', 'esp-1'],
    calificacion: 4.8,
  },
  {
    id: 'fis-4',
    nombres: 'Mateo Alejandro',
    apellidos: 'Cárdenas Ruiz',
    registroProfesional: 'SENESCYT-1005-2021-F04',
    sede: SEDE_UNICA,
    fotoUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&auto=format&fit=crop&q=80',
    especialidadesIds: ['esp-2', 'esp-4', 'esp-5'],
    calificacion: 4.7,
  },
  {
    id: 'fis-5',
    nombres: 'Sofía Valentina',
    apellidos: 'Viteri Pazmiño',
    registroProfesional: 'SENESCYT-1005-2024-F05',
    sede: SEDE_UNICA,
    fotoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
    especialidadesIds: ['esp-1', 'esp-3', 'esp-4'],
    calificacion: 4.9,
  },
];

export const PACIENTE_ACTUAL_MOCK: Usuario = {
  id: 'pac-1724216526',
  nombres: 'Brayan Eduardo',
  apellidos: 'Loya Cadena',
  cedula: '1724216526',
  correo: 'brayan.loya@uce.edu.ec',
  telefono: '0998765432',
  fechaNacimiento: '1998-05-14',
  rol: 'PACIENTE',
  consentimientoLOPDP: true,
  fechaConsentimiento: '2026-02-15 08:30:00',
  expoPushToken: 'ExponentPushToken[mock-brayan-loya-token]',
};

export const CITAS_INICIALES_MOCK: Cita[] = [
  {
    id: 'cita-101',
    pacienteId: 'pac-1724216526',
    pacienteNombreCompleto: 'Brayan Eduardo Loya Cadena',
    fisioterapeutaId: 'fis-2',
    fisioterapeutaNombreCompleto: 'Lcdo. Kevin Pozo Maldonado',
    especialidadId: 'esp-2',
    especialidadNombre: 'Fisioterapia Deportiva',
    sede: SEDE_UNICA,
    fecha: '2026-10-29',
    horaInicio: '10:00',
    horaFin: '11:00',
    estado: 'PROGRAMADA',
    modalidadPago: 'PRESENCIAL_RECEPCION',
    estadoPago: 'PENDIENTE',
    documentoPrescripcionUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    createdAt: '2026-10-25T14:30:00Z',
  },
  {
    id: 'cita-100',
    pacienteId: 'pac-1724216526',
    pacienteNombreCompleto: 'Brayan Eduardo Loya Cadena',
    fisioterapeutaId: 'fis-1',
    fisioterapeutaNombreCompleto: 'Lcdo. Bryan Loya Cadena',
    especialidadId: 'esp-1',
    especialidadNombre: 'Fisioterapia Traumatológica',
    sede: SEDE_UNICA,
    fecha: '2026-10-15',
    horaInicio: '15:00',
    horaFin: '16:00',
    estado: 'COMPLETADA',
    modalidadPago: 'PRESENCIAL_RECEPCION',
    estadoPago: 'PAGADO',
    documentoPrescripcionUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    createdAt: '2026-10-10T09:15:00Z',
  },
  {
    id: 'cita-099',
    pacienteId: 'pac-1724216526',
    pacienteNombreCompleto: 'Brayan Eduardo Loya Cadena',
    fisioterapeutaId: 'fis-3',
    fisioterapeutaNombreCompleto: 'Lcda. Andrea Morales Silva',
    especialidadId: 'esp-3',
    especialidadNombre: 'Fisioterapia Neurológica',
    sede: SEDE_UNICA,
    fecha: '2026-10-01',
    horaInicio: '09:00',
    horaFin: '10:00',
    estado: 'COMPLETADA',
    modalidadPago: 'PRESENCIAL_RECEPCION',
    estadoPago: 'PAGADO',
    createdAt: '2026-09-28T11:00:00Z',
  },
];

export const DOCUMENTOS_MOCK: DocumentoMedico[] = [
  {
    id: 'doc-01',
    pacienteId: 'pac-1724216526',
    fisioterapeutaNombre: 'Lcdo. Kevin Pozo Maldonado',
    titulo: 'Rutina Domiciliaria: Fortalecimiento de Rodilla y Cadera',
    tipo: 'RUTINA_EJERCICIOS',
    fechaEmision: '2026-10-15',
    archivoUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    tamano: '1.4 MB',
  },
  {
    id: 'doc-02',
    pacienteId: 'pac-1724216526',
    fisioterapeutaNombre: 'Lcda. Andrea Morales Silva',
    titulo: 'Recomendaciones Posturales y Ergonomía de Trabajo',
    tipo: 'RECOMENDACION_POSTURAL',
    fechaEmision: '2026-10-01',
    archivoUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    tamano: '890 KB',
  },
  {
    id: 'doc-03',
    pacienteId: 'pac-1724216526',
    fisioterapeutaNombre: 'Lcdo. Kevin Pozo Maldonado',
    titulo: 'Orden de Compra: Banda Elástica TheraBand Azul y Compresa Fría',
    tipo: 'RECETA_MEDICA',
    fechaEmision: '2026-10-15',
    archivoUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    tamano: '420 KB',
  },
];

export const EVOLUCION_EVA_MOCK: RegistroEVA[] = [
  {
    id: 'eva-1',
    pacienteId: 'pac-1724216526',
    fecha: '01 Oct 2026',
    nivelDolor: 7,
    zonaAfectada: 'Ligamento cruzado anterior',
    comentario: 'Molestia moderada en flexión profunda.',
  },
  {
    id: 'eva-2',
    pacienteId: 'pac-1724216526',
    fecha: '15 Oct 2026',
    nivelDolor: 4,
    zonaAfectada: 'Rodilla derecha',
    comentario: 'Buena respuesta tras sesión de electroestimulación.',
  },
  {
    id: 'eva-3',
    pacienteId: 'pac-1724216526',
    fecha: '25 Oct 2026',
    nivelDolor: 2,
    zonaAfectada: 'Rodilla derecha',
    comentario: 'Movilidad articular completa sin edema.',
  },
];

export const NOTIFICACIONES_MOCK: Notificacion[] = [
  {
    id: 'notif-1',
    titulo: 'Recordatorio de Cita Médica',
    mensaje: 'Tienes una cita de Fisioterapia Deportiva para el 29 de octubre a las 10:00 con Lcdo. Kevin Pozo en la sede Tumbaco.',
    fecha: 'Hace 2 horas',
    leida: false,
    tipo: 'RECORDATORIO_CITA',
    citaId: 'cita-101',
  },
  {
    id: 'notif-2',
    titulo: 'Nueva Rutina Prescrita',
    mensaje: 'Tu especialista ha subido la rutina de ejercicios de rehabilitación domiciliaria.',
    fecha: 'Ayer',
    leida: true,
    tipo: 'NUEVO_DOCUMENTO',
  },
  {
    id: 'notif-3',
    titulo: 'Control Transaccional LOPDP',
    mensaje: 'Tu consentimiento informado fue registrado exitosamente conforme a la normativa vigente.',
    fecha: '15 Oct 2026',
    leida: true,
    tipo: 'SISTEMA',
  },
];

// Generador de bloques horarios de 1 hora fija
export function generarBloquesDisponibles(fecha: string, fisioterapeutaId: string): { id: string; horaInicio: string; horaFin: string }[] {
  const todos = [
    { horaInicio: '08:00', horaFin: '09:00' },
    { horaInicio: '09:00', horaFin: '10:00' },
    { horaInicio: '10:00', horaFin: '11:00' },
    { horaInicio: '11:00', horaFin: '12:00' },
    { horaInicio: '14:00', horaFin: '15:00' },
    { horaInicio: '15:00', horaFin: '16:00' },
    { horaInicio: '16:00', horaFin: '17:00' },
  ];

  // Simulación de turnos libres para no saturar
  return todos.filter((_, idx) => (idx + fecha.length + (fisioterapeutaId.length % 2)) % 3 !== 0).map((h, i) => ({
    id: `blk-${fecha}-${fisioterapeutaId}-${i}`,
    ...h,
  }));
}
