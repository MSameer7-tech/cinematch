export interface ServiceSuccess<T> {
  success: true;
  data: T;
  error?: never;
}

export interface ServiceFailure {
  success: false;
  data?: never;
  error: string;
}

/**
 * Standardized result format for all application service methods.
 */
export type ServiceResult<T> = ServiceSuccess<T> | ServiceFailure;
