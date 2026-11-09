import { isAxiosError } from 'axios';
import {
  ConflictError,
  DomainError,
  NetworkError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../core/domain';

export function handleAxiosError(error: unknown): never {
  if (isAxiosError(error)) {
    if (!error.response) {
      throw new NetworkError(
        error.message || 'No se pudo contactar con el servidor de Innova Fisioterapia.'
      );
    }

    const status = error.response.status;
    const data = error.response.data as any;
    const message = data?.message || data?.error || error.message || 'Error en la petición';

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
      throw new ValidationError(message || 'Datos de formulario inválidos.', data?.errors);
    }

    throw new DomainError(message, `HTTP_${status}`, status);
  }

  if (error instanceof DomainError) {
    throw error;
  }

  throw new DomainError((error as any)?.message || 'Error inesperado del sistema.');
}
