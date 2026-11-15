import {
  AgendarCitaDTO,
  BloqueHorario,
  Cita,
  ConflictError,
  Especialidad,
  Fisioterapeuta,
  NotFoundError,
} from '../../core/domain';
import { IAppointmentRepository } from '../../core/ports';
import {
  CITAS_INICIALES_MOCK,
  ESPECIALIDADES_MOCK,
  FISIOTERAPEUTAS_MOCK,
  SEDE_UNICA,
  generarBloquesDisponibles,
} from './mockData';

export class MockAppointmentRepository implements IAppointmentRepository {
  private citas: Cita[] = [...CITAS_INICIALES_MOCK];

  async getEspecialidades(): Promise<Especialidad[]> {
    await new Promise((res) => setTimeout(res, 200));
    return [...ESPECIALIDADES_MOCK];
  }

  async getFisioterapeutas(): Promise<Fisioterapeuta[]> {
    await new Promise((res) => setTimeout(res, 250));
    return [...FISIOTERAPEUTAS_MOCK];
  }

  async getDisponibilidad(fecha: string, doctorId: string, _servicioId?: string): Promise<BloqueHorario[]> {
    await new Promise((res) => setTimeout(res, 300));
    const raw = generarBloquesDisponibles(fecha, doctorId);
    return raw.map((item) => ({
      id: item.id,
      horaInicio: item.horaInicio,
      horaFin: item.horaFin,
      disponible: true,
      fisioterapeutaId: doctorId,
      fecha,
    }));
  }

  async agendarCita(dto: AgendarCitaDTO): Promise<Cita> {
    await new Promise((res) => setTimeout(res, 600));

    // SIMULACIÓN OBLIGATORIA DE CONCURRENCIA PARA LA DEFENSA DE TESIS:
    // Si la hora solicitada es exactamente '08:00', lanzamos un 409 Conflict
    if (dto.horaInicio === '08:00') {
      throw new ConflictError(
        'El horario de las 08:00 acaba de ser tomado por otro paciente en recepción (Conflicto 409).'
      );
    }

    // PROTECCIÓN CONTRA DUPLICIDAD / COLISIÓN CONCURRENTE:
    // Si ya existe una cita programada para el mismo fisioterapeuta, fecha y hora de inicio
    const yaExiste = this.citas.some(
      (c) =>
        c.fisioterapeutaId === dto.fisioterapeutaId &&
        c.fecha === dto.fecha &&
        c.horaInicio === dto.horaInicio &&
        c.estado === 'PROGRAMADA'
    );
    if (yaExiste) {
      throw new ConflictError(
        'Este turno ya ha sido reservado. Por favor, selecciona otro horario disponible.'
      );
    }

    const nuevaCita: Cita = {
      id: `cita-${Date.now().toString().slice(-4)}`,
      pacienteId: dto.pacienteId,
      pacienteNombreCompleto: dto.pacienteNombre,
      fisioterapeutaId: dto.fisioterapeutaId,
      fisioterapeutaNombreCompleto: dto.fisioterapeutaNombre.startsWith('Lcdo')
        ? dto.fisioterapeutaNombre
        : `Lcdo. ${dto.fisioterapeutaNombre}`,
      especialidadId: dto.especialidadId,
      especialidadNombre: dto.especialidadNombre,
      sede: dto.sede || SEDE_UNICA,
      fecha: dto.fecha,
      horaInicio: dto.horaInicio,
      horaFin: dto.horaFin,
      estado: 'PROGRAMADA',
      modalidadPago: 'PRESENCIAL_RECEPCION',
      estadoPago: 'PENDIENTE',
      createdAt: new Date().toISOString(),
    };

    this.citas = [nuevaCita, ...this.citas];
    return nuevaCita;
  }

  async cancelarCita(id: string, _motivo?: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 400));
    const index = this.citas.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new NotFoundError(`No se encontró la cita con ID ${id}`);
    }
    this.citas[index] = {
      ...this.citas[index],
      estado: 'CANCELADA',
    };
    return true;
  }

  async getMisCitas(): Promise<Cita[]> {
    await new Promise((res) => setTimeout(res, 350));
    return [...this.citas];
  }
}
