import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DocumentoClinico, Notificacion, RegistroEva } from '../../core/domain';
import {
  clinicalRepository,
  documentRepository,
  notificationRepository,
} from '../../infrastructure/container';
import { useAuth } from '../context/AuthContext';

export const CLINICAL_KEYS = {
  eva: ['clinical', 'eva'] as const,
  documentos: ['clinical', 'documentos'] as const,
  notificaciones: ['clinical', 'notificaciones'] as const,
};

export function useHistorialEva() {
  const { usuario } = useAuth();
  return useQuery<RegistroEva[]>({
    queryKey: CLINICAL_KEYS.eva,
    queryFn: () => clinicalRepository.getHistorialEva(),
    enabled: Boolean(usuario),
  });
}

export function useDocumentos() {
  const { usuario } = useAuth();
  return useQuery<DocumentoClinico[]>({
    queryKey: CLINICAL_KEYS.documentos,
    queryFn: () => documentRepository.getDocumentos(),
    enabled: Boolean(usuario),
  });
}

export function useNotificaciones() {
  const { usuario } = useAuth();
  return useQuery<Notificacion[]>({
    queryKey: CLINICAL_KEYS.notificaciones,
    queryFn: () => notificationRepository.getNotificaciones(),
    enabled: Boolean(usuario),
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
