import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DocumentoClinico, Notificacion, RegistroEva } from '../../core/domain';
import {
  clinicalRepository,
  documentRepository,
  notificationRepository,
} from '../../infrastructure/container';

export const CLINICAL_KEYS = {
  eva: ['clinical', 'eva'] as const,
  documentos: ['clinical', 'documentos'] as const,
  notificaciones: ['clinical', 'notificaciones'] as const,
};

export function useHistorialEva() {
  return useQuery<RegistroEva[]>({
    queryKey: CLINICAL_KEYS.eva,
    queryFn: () => clinicalRepository.getHistorialEva(),
  });
}

export function useAgregarRegistroEva() {
  const queryClient = useQueryClient();

  return useMutation<RegistroEva, Error, Omit<RegistroEva, 'id'>>({
    mutationFn: (registro) => clinicalRepository.agregarRegistroEva(registro),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLINICAL_KEYS.eva });
    },
  });
}

export function useDocumentos() {
  return useQuery<DocumentoClinico[]>({
    queryKey: CLINICAL_KEYS.documentos,
    queryFn: () => documentRepository.getDocumentos(),
  });
}

export function useNotificaciones() {
  return useQuery<Notificacion[]>({
    queryKey: CLINICAL_KEYS.notificaciones,
    queryFn: () => notificationRepository.getNotificaciones(),
  });
}

export function useMarcarNotificacionesLeidas() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => notificationRepository.marcarComoLeidas(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLINICAL_KEYS.notificaciones });
    },
  });
}
