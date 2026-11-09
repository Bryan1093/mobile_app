import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AgendarCitaDTO, BloqueHorario, Cita, Especialidad, Fisioterapeuta } from '../../core/domain';
import { appointmentRepository } from '../../infrastructure/container';

export const APPOINTMENT_KEYS = {
  all: ['appointments'] as const,
  especialidades: () => [...APPOINTMENT_KEYS.all, 'especialidades'] as const,
  fisioterapeutas: () => [...APPOINTMENT_KEYS.all, 'fisioterapeutas'] as const,
  disponibilidad: (fecha: string, doctorId: string) =>
    [...APPOINTMENT_KEYS.all, 'disponibilidad', fecha, doctorId] as const,
  misCitas: () => [...APPOINTMENT_KEYS.all, 'mis-citas'] as const,
};

export function useEspecialidades() {
  return useQuery<Especialidad[]>({
    queryKey: APPOINTMENT_KEYS.especialidades(),
    queryFn: () => appointmentRepository.getEspecialidades(),
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}

export function useFisioterapeutas() {
  return useQuery<Fisioterapeuta[]>({
    queryKey: APPOINTMENT_KEYS.fisioterapeutas(),
    queryFn: () => appointmentRepository.getFisioterapeutas(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useDisponibilidad(fecha: string, doctorId: string) {
  return useQuery<BloqueHorario[]>({
    queryKey: APPOINTMENT_KEYS.disponibilidad(fecha, doctorId),
    queryFn: () => appointmentRepository.getDisponibilidad(fecha, doctorId),
    enabled: Boolean(fecha && doctorId),
  });
}

export function useCitas() {
  return useQuery<Cita[]>({
    queryKey: APPOINTMENT_KEYS.misCitas(),
    queryFn: () => appointmentRepository.getMisCitas(),
  });
}

export function useAgendarCita() {
  const queryClient = useQueryClient();

  return useMutation<Cita, Error, AgendarCitaDTO>({
    mutationFn: (dto) => appointmentRepository.agendarCita(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENT_KEYS.misCitas() });
      queryClient.invalidateQueries({ queryKey: [...APPOINTMENT_KEYS.all, 'disponibilidad'] });
    },
  });
}

export function useCancelarCita() {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: (citaId) => appointmentRepository.cancelarCita(citaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENT_KEYS.misCitas() });
    },
  });
}
