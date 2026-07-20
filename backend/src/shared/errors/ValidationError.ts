import { AppError } from './AppError';

export interface ValidationIssue {
  field: string;
  message: string;
}

export class ValidationError extends AppError {
  public readonly issues: ValidationIssue[];

  constructor(issues: ValidationIssue[]) {
    super('Validation failed', 400, 'VALIDATION_ERROR', {
      details: { issues },
    });
    this.issues = issues;
  }
}
