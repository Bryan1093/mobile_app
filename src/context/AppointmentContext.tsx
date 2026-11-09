import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Cita,
  ConflictError,
  DocumentoClinico,
  Notificacion,
  RegistroEva,
  ReservaParams,
} from '../core/domain';
import {
  appointmentRepository,
  clinicalRepository,
  documentRepository,
  notificationRepository,
} from '../infrastructure/container';

interface AppointmentContextType {
  citas: Cita[];
  documentos: DocumentoClinico[];
  notificaciones: Notificacion[];
  registrosEVA: RegistroEva[];
  cargando: boolean;
  conflictModalVisible: boolean;
  setConflictModalVisible: (val: boolean) => void;
  agendarCita: (params: ReservaParams) => Promise<{ success: boolean; errorConflict?: boolean }>;
  cancelarCita: (citaId: string) => Promise<boolean>;
  marcarNotificacionesLeidas: () => void;
  agregarRegistroEVA: (nivel: number, zona: string, comentario: string) => void;
  contadorNotificacionesNoLeidas: number;
  recargarDatos: () => Promise<void>;
}

const AppointmentContext = createContext<AppointmentContextType>({} as AppointmentContextType);

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [documentos, setDocumentos] = useState<DocumentoClinico[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [registrosEVA, setRegistrosEVA] = useState<RegistroEva[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [conflictModalVisible, setConflictModalVisible] = useState<boolean>(false);

  const contadorNotificacionesNoLeidas = notificaciones.filter((n) => !n.leida).length;

  const recargarDatos = async () => {
    setCargando(true);
    try {
      const [citasRes, docRes, notifRes, evaRes] = await Promise.all([
        appointmentRepository.getMisCitas(),
        documentRepository.getDocumentos(),
        notificationRepository.getNotificaciones(),
        clinicalRepository.getHistorialEva(),
      ]);
      setCitas(citasRes);
      setDocumentos(docRes);
      setNotificaciones(notifRes);
      setRegistrosEVA(evaRes);
    } catch (err) {
      console.warn('[AppointmentContext] Error cargando datos de repositorios:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const cargarInicial = async () => {
      try {
        const [citasRes, docRes, notifRes, evaRes] = await Promise.all([
          appointmentRepository.getMisCitas(),
          documentRepository.getDocumentos(),
          notificationRepository.getNotificaciones(),
          clinicalRepository.getHistorialEva(),
        ]);
        if (isMounted) {
          setCitas(citasRes);
          setDocumentos(docRes);
          setNotificaciones(notifRes);
          setRegistrosEVA(evaRes);
        }
      } catch (err) {
        console.warn('[AppointmentContext] Error inicial:', err);
      } finally {
        if (isMounted) {
          setCargando(false);
        }
      }
    };

    cargarInicial();

    return () => {
      isMounted = false;
    };
  }, []);

  const agendarCita = async ({
    pacienteId,
    pacienteNombre,
    especialidad,
    fisioterapeuta,
    fecha,
    bloque,
  }: ReservaParams): Promise<{ success: boolean; errorConflict?: boolean }> => {
    try {
      const nuevaCita = await appointmentRepository.agendarCita({
        pacienteId,
        pacienteNombre,
        especialidadId: especialidad.id,
        especialidadNombre: especialidad.nombre,
        fisioterapeutaId: fisioterapeuta.id,
        fisioterapeutaNombre: `${fisioterapeuta.nombres} ${fisioterapeuta.apellidos}`,
        fecha,
        horaInicio: bloque.horaInicio,
        horaFin: bloque.horaFin,
        sede: fisioterapeuta.sede,
      });

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
    } catch (error: any) {
      if (error instanceof ConflictError || error?.code === 'CONFLICT_409' || error?.statusCode === 409) {
        setConflictModalVisible(true);
        return { success: false, errorConflict: true };
      }
      console.error('[AppointmentContext] Error al agendar cita:', error);
      throw error;
    }
  };

  const cancelarCita = async (citaId: string): Promise<boolean> => {
    try {
      await appointmentRepository.cancelarCita(citaId);
      setCitas((prev) =>
        prev.map((c) => (c.id === citaId ? { ...c, estado: 'CANCELADA' as const } : c))
      );
      return true;
    } catch (err) {
      console.error('[AppointmentContext] Error cancelando cita:', err);
      return false;
    }
  };

  const marcarNotificacionesLeidas = async () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    try {
      await notificationRepository.marcarComoLeidas();
    } catch (err) {
      console.warn('[AppointmentContext] Error marcando notificaciones como leídas:', err);
    }
  };

  const agregarRegistroEVA = async (nivelDolor: number, zonaAfectada: string, comentario: string) => {
    try {
      const nuevoReg = await clinicalRepository.agregarRegistroEva({
        pacienteId: 'pac-1725893412',
        fecha: new Date().toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' }),
        nivelDolor,
        zonaAfectada,
        comentario,
      });
      setRegistrosEVA((prev) => [nuevoReg, ...prev]);
    } catch (err) {
      console.error('[AppointmentContext] Error agregando registro EVA:', err);
    }
  };

  return (
    <AppointmentContext.Provider
      value={{
        citas,
        documentos,
        notificaciones,
        registrosEVA,
        cargando,
        conflictModalVisible,
        setConflictModalVisible,
        agendarCita,
        cancelarCita,
        marcarNotificacionesLeidas,
        agregarRegistroEVA,
        contadorNotificacionesNoLeidas,
        recargarDatos,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => useContext(AppointmentContext);
