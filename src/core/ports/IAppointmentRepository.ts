import {
  AgendarCitaDTO,
  BloqueHorario,
  Cita,
  Especialidad,
  Fisioterapeuta,
} from '../domain/entities';

export interface IAppointmentRepository {
  getEspecialidades(): Promise<Especialidad[]>;
  getFisioterapeutas(): Promise<Fisioterapeuta[]>;
  getDisponibilidad(fecha: string, doctorId: string, servicioId?: string): Promise<BloqueHorario[]>;
  agendarCita(dto: AgendarCitaDTO): Promise<Cita>;
  cancelarCita(id: string, motivo?: string): Promise<boolean>;
  getMisCitas(): Promise<Cita[]>;
}
