import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AgendarCitaDTO, BloqueHorario, Cita, Especialidad, Fisioterapeuta } from '../../core/domain';
import { appointmentRepository } from '../../infrastructure/container';
import { useAuth } from '../context/AuthContext';

export const APPOINTMENT_KEYS = {
  all: ['appointments'] as const,
  especialidades: () => [...APPOINTMENT_KEYS.all, 'especialidades'] as const,
  fisioterapeutas: () => [...APPOINTMENT_KEYS.all, 'fisioterapeutas'] as const,
  disponibilidad: (fecha: string, doctorId: string, servicioId?: string) =>
    [...APPOINTMENT_KEYS.all, 'disponibilidad', fecha, doctorId, servicioId ?? ''] as const,
  misCitas: () => [...APPOINTMENT_KEYS.all, 'mis-citas'] as const,
};

export function useEspecialidades() {
  const { usuario } = useAuth();
  return useQuery<Especialidad[]>({
    queryKey: APPOINTMENT_KEYS.especialidades(),
    queryFn: () => appointmentRepository.getEspecialidades(),
    enabled: Boolean(usuario),
    staleTime: 1000 * 15,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

export function useFisioterapeutas() {
  const { usuario } = useAuth();
  return useQuery<Fisioterapeuta[]>({
    queryKey: APPOINTMENT_KEYS.fisioterapeutas(),
    queryFn: () => appointmentRepository.getFisioterapeutas(),
    enabled: Boolean(usuario),
    staleTime: 1000 * 15,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

export function useDisponibilidad(fecha: string, doctorId: string, servicioId?: string) {
  const { usuario } = useAuth();
  return useQuery<BloqueHorario[]>({
    queryKey: APPOINTMENT_KEYS.disponibilidad(fecha, doctorId, servicioId),
    queryFn: () => appointmentRepository.getDisponibilidad(fecha, doctorId, servicioId),
    enabled: Boolean(usuario && fecha && doctorId),
    staleTime: 1000 * 15,
  });
}

export function useCitas() {
  const { usuario } = useAuth();
  return useQuery<Cita[]>({
    queryKey: APPOINTMENT_KEYS.misCitas(),
    queryFn: () => appointmentRepository.getMisCitas(),
    enabled: Boolean(usuario),
    staleTime: 1000 * 15,
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
