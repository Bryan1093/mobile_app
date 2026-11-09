import { apiClient } from '../../api/client';
import {
  AgendarCitaDTO,
  BloqueHorario,
  Cita,
  Especialidad,
  Fisioterapeuta,
} from '../../core/domain';
import { IAppointmentRepository } from '../../core/ports';
import { handleAxiosError } from './httpErrors';

export class HttpAppointmentRepository implements IAppointmentRepository {
  async getEspecialidades(): Promise<Especialidad[]> {
    try {
      const response = await apiClient.get('/especialidades');
      return response.data?.data || response.data;
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  async getFisioterapeutas(): Promise<Fisioterapeuta[]> {
    try {
      const response = await apiClient.get('/fisioterapeutas');
      return response.data?.data || response.data;
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  async getDisponibilidad(fecha: string, doctorId: string): Promise<BloqueHorario[]> {
    try {
      const response = await apiClient.get('/turnos/disponibles', {
        params: { fecha, doctorId },
      });
      return response.data?.data || response.data;
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  async agendarCita(dto: AgendarCitaDTO): Promise<Cita> {
    try {
      // POST /citas - en caso de colisión en PostgreSQL, backend retorna 409 Conflict
      const response = await apiClient.post('/citas', dto);
      return response.data?.data || response.data;
    } catch (error) {
      return handleAxiosError(error);
    }
  }

  async cancelarCita(id: string): Promise<boolean> {
    try {
      await apiClient.patch(`/citas/${id}/cancelar`);
      return true;
    } catch {
      try {
        // Fallback POST si la ruta de Kevin usa POST
        await apiClient.post(`/citas/${id}/cancelar`);
        return true;
      } catch (err) {
        return handleAxiosError(err);
      }
    }
  }

  async getMisCitas(): Promise<Cita[]> {
    try {
      const response = await apiClient.get('/pacientes/me/citas');
      return response.data?.data || response.data;
    } catch (error) {
      return handleAxiosError(error);
    }
  }
}
