import {
  AgendarCitaDTO,
  BloqueHorario,
  Cita,
  Especialidad,
  EstadoCita,
  Fisioterapeuta,
} from '../../core/domain';
import { IAppointmentRepository } from '../../core/ports';
import { apiClient } from './client';
import { handleAxiosError } from './httpErrors';

const SEDE_CLINICA = 'Innova Fisioterapia - Tumbaco';

interface ServicioDTO {
  id: string;
  nombre: string;
  duracionMinutos: number;
  activo: boolean;
}

interface HorarioDTO {
  id: string;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
}

interface FisioterapeutaDTO {
  id: string;
  usuarioId: string;
  nombres: string;
  apellidos: string;
  especialidad: string | null;
  registroProfesional: string | null;
  activo: boolean;
  horarios: HorarioDTO[];
}

interface HuecoDisponibleDTO {
  inicio: string;
  fin: string;
  fisioterapeutaId: string;
  camillasLibres: string[];
}

type EstadoCitaApi =
  | 'PROGRAMADA'
  | 'CONFIRMADA'
  | 'EN_ATENCION'
  | 'ATENDIDA'
  | 'CANCELADA'
  | 'NO_ASISTIO';

interface CitaDTO {
  id: string;
  inicio: string;
  fin: string;
  estado: EstadoCitaApi;
  estadoCobro: 'PENDIENTE' | 'PAGADO';
  origen: 'WEB' | 'MOVIL';
  notas: string | null;
  motivoCancelacion: string | null;
  paciente: { id: string; nombres: string; apellidos: string; cedula: string };
  fisioterapeuta: { id: string; nombres: string; apellidos: string };
  camilla: { id: string; codigo: string; nombre: string };
  equipo: { id: string; nombre: string } | null;
  servicio: { id: string; nombre: string; duracionMinutos: number };
  creadoEn: string;
}

function inferIconoServicio(nombre: string): string {
  const n = nombre.toLowerCase();
  if (n.includes('deport')) return 'sports-gymnastics';
  if (n.includes('neuro')) return 'psychology';
  if (n.includes('reuma') || n.includes('geriat')) return 'healing';
  if (n.includes('manual') || n.includes('pun')) return 'medical-services';
  return 'fitness-center';
}

function formatHoraHHmm(isoString: string): string {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) {
    return isoString.slice(11, 16) || '00:00';
  }
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function formatFechaYYYYMMDD(isoString: string): string {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) {
    return isoString.slice(0, 10);
  }
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function mapEstadoCita(estado: EstadoCitaApi): EstadoCita {
  switch (estado) {
    case 'PROGRAMADA':
    case 'CONFIRMADA':
      return 'PROGRAMADA';
    case 'EN_ATENCION':
      return 'EN_CURSO';
    case 'ATENDIDA':
      return 'COMPLETADA';
    case 'CANCELADA':
    case 'NO_ASISTIO':
      return 'CANCELADA';
    default:
      return 'PROGRAMADA';
  }
}

function mapCitaDtoToDomain(dto: CitaDTO): Cita {
  return {
    id: dto.id,
    pacienteId: dto.paciente.id,
    pacienteNombreCompleto: `${dto.paciente.nombres} ${dto.paciente.apellidos}`.trim(),
    fisioterapeutaId: dto.fisioterapeuta.id,
    fisioterapeutaNombreCompleto: `Lcdo. ${dto.fisioterapeuta.nombres} ${dto.fisioterapeuta.apellidos}`.trim(),
    especialidadId: dto.servicio.id,
    especialidadNombre: dto.servicio.nombre,
    sede: SEDE_CLINICA,
    fecha: formatFechaYYYYMMDD(dto.inicio),
    horaInicio: formatHoraHHmm(dto.inicio),
    horaFin: formatHoraHHmm(dto.fin),
    estado: mapEstadoCita(dto.estado),
    modalidadPago: 'PRESENCIAL_RECEPCION',
    estadoPago: dto.estadoCobro,
    createdAt: dto.creadoEn,
  };
}

export class HttpAppointmentRepository implements IAppointmentRepository {
  private async fetchServiciosActivos(): Promise<ServicioDTO[]> {
    const response = await apiClient.get<ServicioDTO[]>('/servicios');
    const lista = Array.isArray(response.data) ? response.data : [];
    return lista.filter((s) => s.activo !== false);
  }

  async getEspecialidades(): Promise<Especialidad[]> {
    try {
      const activos = await this.fetchServiciosActivos();

      return activos.map((s) => ({
        id: s.id,
        nombre: s.nombre,
        descripcion: `Sesión de ${s.nombre} (${s.duracionMinutos} min)`,
        duracionMinutos: s.duracionMinutos,
        icono: inferIconoServicio(s.nombre),
      }));
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  async getFisioterapeutas(): Promise<Fisioterapeuta[]> {
    try {
      const [fisioRes, servicios] = await Promise.all([
        apiClient.get<FisioterapeutaDTO[]>('/fisioterapeutas', {
          params: { soloActivos: true },
        }),
        this.fetchServiciosActivos().catch(() => [] as ServicioDTO[]),
      ]);

      const lista = (Array.isArray(fisioRes.data) ? fisioRes.data : []).filter(
        (f) => f.activo !== false
      );
      const todosServiciosIds = servicios.map((s) => s.id);

      return lista.map((f) => {
        const espTexto = f.especialidad?.trim().toLowerCase() ?? '';
        const matchedIds = espTexto
          ? servicios
              .filter(
                (s) =>
                  s.nombre.toLowerCase().includes(espTexto) ||
                  espTexto.includes(s.nombre.toLowerCase())
              )
              .map((s) => s.id)
          : [];

        return {
          id: f.id,
          nombres: f.nombres,
          apellidos: f.apellidos,
          especialidad: f.especialidad ?? undefined,
          fotoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            `${f.nombres} ${f.apellidos}`
          )}&background=0F766E&color=fff&size=256`,
          registroProfesional: f.registroProfesional ?? 'Registro profesional verificado',
          sede: SEDE_CLINICA,
          especialidadesIds: matchedIds.length > 0 ? matchedIds : todosServiciosIds,
          calificacion: 4.9,
        };
      });
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  async getDisponibilidad(
    fecha: string,
    doctorId: string,
    servicioId?: string
  ): Promise<BloqueHorario[]> {
    try {
      let resolvedServicioId = servicioId && servicioId !== 'TODAS' ? servicioId : undefined;
      if (!resolvedServicioId) {
        const servicios = await this.fetchServiciosActivos();
        resolvedServicioId = servicios[0]?.id;
      }

      if (!resolvedServicioId) {
        return [];
      }

      const response = await apiClient.get<HuecoDisponibleDTO[]>('/disponibilidad', {
        params: {
          fecha,
          servicioId: resolvedServicioId,
          fisioterapeutaId: doctorId,
        },
      });

      const huecos = Array.isArray(response.data) ? response.data : [];
      return huecos
        .filter((h) => Array.isArray(h.camillasLibres) && h.camillasLibres.length > 0)
        .map((h) => ({
          id: `${h.fisioterapeutaId}_${h.inicio}`,
          horaInicio: formatHoraHHmm(h.inicio),
          horaFin: formatHoraHHmm(h.fin),
          disponible: true,
          fisioterapeutaId: h.fisioterapeutaId,
          fecha,
          camillaId: h.camillasLibres[0],
          inicioIso: h.inicio,
          finIso: h.fin,
        }));
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  async agendarCita(dto: AgendarCitaDTO): Promise<Cita> {
    try {
      const inicio =
        dto.inicioIso ?? new Date(`${dto.fecha}T${dto.horaInicio}:00`).toISOString();

      const payload: Record<string, unknown> = {
        fisioterapeutaId: dto.fisioterapeutaId,
        camillaId: dto.camillaId,
        servicioId: dto.especialidadId,
        inicio,
      };
      if (dto.notas) {
        payload.notas = dto.notas;
      }

      // POST /citas - en caso de colisión en PostgreSQL, backend retorna 409 Conflict
      const response = await apiClient.post<CitaDTO>('/citas', payload);
      return mapCitaDtoToDomain(response.data);
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  async cancelarCita(id: string, motivo?: string): Promise<boolean> {
    try {
      await apiClient.post(`/citas/${id}/cancelar`, {
        motivo: motivo || 'Cancelación solicitada por el paciente desde la app móvil',
      });
      return true;
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  async getMisCitas(): Promise<Cita[]> {
    try {
      const response = await apiClient.get<CitaDTO[]>('/me/citas');
      const lista = Array.isArray(response.data) ? response.data : [];
      return lista.map(mapCitaDtoToDomain);
    } catch (error) {
      return handleAxiosError(error);
    }
  }
}
