export class DomainError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;

  constructor(message: string, code: string = 'DOMAIN_ERROR', statusCode?: number) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Conflicto de concurrencia (HTTP 409)
 * Usado para la validación de transacciones simultáneas en la defensa de tesis
 */
export class ConflictError extends DomainError {
  constructor(
    message: string = 'El horario seleccionado acaba de ser reservado por otro usuario.'
  ) {
    super(message, 'CONFLICT_409', 409);
    this.name = 'ConflictError';
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Credenciales no válidas o sesión expirada.') {
    super(message, 'UNAUTHORIZED_401', 401);
    this.name = 'UnauthorizedError';
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string = 'El recurso solicitado no fue encontrado.') {
    super(message, 'NOT_FOUND_404', 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends DomainError {
  public readonly errors?: Record<string, string[]>;

  constructor(message: string = 'Los datos ingresados no son válidos.', errors?: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR', 422);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class NetworkError extends DomainError {
  constructor(message: string = 'No se pudo conectar con el servidor clínico. Verifica tu conexión a internet.') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}
