import { AppError } from './AppError';

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details?: Record<string, unknown>) {
    super(message, 409, 'CONFLICT', { details });
  }
}
