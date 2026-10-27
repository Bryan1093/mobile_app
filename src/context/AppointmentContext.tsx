import React, { createContext, useContext, useState } from 'react';
import {
  CITAS_INICIALES_MOCK,
  DOCUMENTOS_MOCK,
  EVOLUCION_EVA_MOCK,
  NOTIFICACIONES_MOCK,
  SEDE_UNICA,
} from '../data/mockData';
import { BloqueHorario, Cita, DocumentoMedico, Especialidad, Fisioterapeuta, Notificacion, RegistroEVA } from '../types';

interface ReservaParams {
  pacienteId: string;
  pacienteNombre: string;
  especialidad: Especialidad;
  fisioterapeuta: Fisioterapeuta;
  fecha: string;
  bloque: BloqueHorario;
}

interface AppointmentContextType {
  citas: Cita[];
  documentos: DocumentoMedico[];
  notificaciones: Notificacion[];
  registrosEVA: RegistroEVA[];
  conflictModalVisible: boolean;
  setConflictModalVisible: (val: boolean) => void;
  agendarCita: (params: ReservaParams) => Promise<{ success: boolean; errorConflict?: boolean }>;
  cancelarCita: (citaId: string) => Promise<boolean>;
  marcarNotificacionesLeidas: () => void;
  agregarRegistroEVA: (nivel: number, zona: string, comentario: string) => void;
  contadorNotificacionesNoLeidas: number;
}

const AppointmentContext = createContext<AppointmentContextType>({} as AppointmentContextType);

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [citas, setCitas] = useState<Cita[]>(CITAS_INICIALES_MOCK);
  const [documentos] = useState<DocumentoMedico[]>(DOCUMENTOS_MOCK);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(NOTIFICACIONES_MOCK);
  const [registrosEVA, setRegistrosEVA] = useState<RegistroEVA[]>(EVOLUCION_EVA_MOCK);
  const [conflictModalVisible, setConflictModalVisible] = useState<boolean>(false);

  const contadorNotificacionesNoLeidas = notificaciones.filter((n) => !n.leida).length;

  const agendarCita = async ({
    pacienteId,
    pacienteNombre,
    especialidad,
    fisioterapeuta,
    fecha,
    bloque,
  }: ReservaParams): Promise<{ success: boolean; errorConflict?: boolean }> => {
    // Simulación de control de concurrencia:
    // Si la hora es exactamente "08:00" en simulación, disparamos condición de carrera (HTTP 409 Conflict)
    if (bloque.horaInicio === '08:00') {
      setConflictModalVisible(true);
      return { success: false, errorConflict: true };
    }

    const nuevaCita: Cita = {
      id: `cita-${Date.now().toString().slice(-4)}`,
      pacienteId,
      pacienteNombreCompleto: pacienteNombre,
      fisioterapeutaId: fisioterapeuta.id,
      fisioterapeutaNombreCompleto: `Lcdo. ${fisioterapeuta.nombres} ${fisioterapeuta.apellidos}`,
      especialidadId: especialidad.id,
      especialidadNombre: especialidad.nombre,
      sede: SEDE_UNICA,
      fecha,
      horaInicio: bloque.horaInicio,
      horaFin: bloque.horaFin,
      estado: 'PROGRAMADA',
      modalidadPago: 'PRESENCIAL_RECEPCION',
      estadoPago: 'PENDIENTE',
      createdAt: new Date().toISOString(),
    };

    setCitas((prev) => [nuevaCita, ...prev]);

    // Agregar notificación de confirmación
    const nuevaNotif: Notificacion = {
      id: `notif-${Date.now()}`,
      titulo: 'Cita Agendada Exitosamente',
      mensaje: `Tu turno para ${especialidad.nombre} ha sido reservado para el ${fecha} de ${bloque.horaInicio} a ${bloque.horaFin}.`,
      fecha: 'Justo ahora',
      leida: false,
      tipo: 'RECORDATORIO_CITA',
      citaId: nuevaCita.id,
    };
    setNotificaciones((prev) => [nuevaNotif, ...prev]);

    return { success: true };
  };

  const cancelarCita = async (citaId: string): Promise<boolean> => {
    setCitas((prev) =>
      prev.map((c) => (c.id === citaId ? { ...c, estado: 'CANCELADA' as const } : c))
    );
    return true;
  };

  const marcarNotificacionesLeidas = () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
  };

  const agregarRegistroEVA = (nivelDolor: number, zonaAfectada: string, comentario: string) => {
    const nuevoReg: RegistroEVA = {
      id: `eva-${Date.now()}`,
      pacienteId: 'pac-1725893412',
      fecha: new Date().toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' }),
      nivelDolor,
      zonaAfectada,
      comentario,
    };
    setRegistrosEVA((prev) => [nuevoReg, ...prev]);
  };

  return (
    <AppointmentContext.Provider
      value={{
        citas,
        documentos,
        notificaciones,
        registrosEVA,
        conflictModalVisible,
        setConflictModalVisible,
        agendarCita,
        cancelarCita,
        marcarNotificacionesLeidas,
        agregarRegistroEVA,
        contadorNotificacionesNoLeidas,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => useContext(AppointmentContext);

