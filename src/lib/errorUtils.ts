/**
 * Error handling utilities
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred') {
    super(message, 'NETWORK_ERROR', 500);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401);
  }
}

/**
 * Centralized error logger
 */
export const logError = (error: Error, context?: string): void => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorInfo);
  }

  // In production, you might want to send to an error tracking service
  // Example: Sentry, LogRocket, etc.
};

/**
 * Error boundary helper for handling async errors
 */
export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>,
  fallbackValue?: T,
  context?: string
): Promise<T | undefined> => {
  try {
    return await asyncFn();
  } catch (error) {
    logError(error as Error, context);
    return fallbackValue;
  }
};

/**
 * Creates a safe async function that won't throw
 */
export const createSafeAsync = <TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  fallbackValue?: TReturn
) => {
  return async (...args: TArgs): Promise<TReturn | undefined> => {
    return handleAsyncError(() => fn(...args), fallbackValue);
  };
};

/**
 * Formats error messages for user display
 */
export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
};

/**
 * Determines if an error is retryable
 */
export const isRetryableError = (error: unknown): boolean => {
  if (error instanceof NetworkError) {
    return true;
  }
  
  if (error instanceof AppError) {
    return error.statusCode === undefined || error.statusCode >= 500;
  }
  
  return false;
};
