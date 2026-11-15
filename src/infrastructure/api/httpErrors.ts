import { isAxiosError } from 'axios';
import {
  ConflictError,
  DomainError,
  NetworkError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../core/domain';

interface ErrorApiPayload {
  codigo?: string;
  mensaje?: string;
  message?: string;
  error?: string;
  detalles?: unknown;
  errors?: Record<string, string[]>;
}

function parseValidationDetails(detalles: unknown): Record<string, string[]> | undefined {
  if (!Array.isArray(detalles)) return undefined;
  const mapped: Record<string, string[]> = {};
  for (const item of detalles) {
    if (
      item &&
      typeof item === 'object' &&
      'campo' in item &&
      'mensaje' in item &&
      typeof (item as { campo: unknown }).campo === 'string' &&
      typeof (item as { mensaje: unknown }).mensaje === 'string'
    ) {
      const campo = (item as { campo: string }).campo || 'general';
      const mensaje = (item as { mensaje: string }).mensaje;
      if (!mapped[campo]) mapped[campo] = [];
      mapped[campo].push(mensaje);
    }
  }
  return Object.keys(mapped).length > 0 ? mapped : undefined;
}

export function handleAxiosError(error: unknown): never {
  if (isAxiosError(error)) {
    if (!error.response) {
      throw new NetworkError(
        error.message || 'No se pudo contactar con el servidor de Innova Fisioterapia.'
      );
    }

    const status = error.response.status;
    const data = error.response.data as ErrorApiPayload | undefined;
    const message =
      data?.mensaje ||
      data?.message ||
      data?.error ||
      error.message ||
      'Error en la petición';

    if (status === 409) {
      throw new ConflictError(
        message || 'Conflicto de concurrencia: el horario acaba de ser reservado por otro usuario.'
      );
    }

    if (status === 401) {
      throw new UnauthorizedError(message || 'No autorizado o token expirado.');
    }

    if (status === 404) {
      throw new NotFoundError(message || 'Recurso no encontrado.');
    }

    if (status === 400 || status === 422) {
      const fieldErrors = data?.errors ?? parseValidationDetails(data?.detalles);
      throw new ValidationError(message || 'Datos de formulario inválidos.', fieldErrors);
    }

    throw new DomainError(message, data?.codigo || `HTTP_${status}`, status);
  }

  if (error instanceof DomainError) {
    throw error;
  }

  throw new DomainError(
    error instanceof Error ? error.message : 'Error inesperado del sistema.'
  );
}
