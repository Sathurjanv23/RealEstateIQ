import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Centralized error handler.
 * Returns structured JSON errors.
 * Never exposes stack traces to the client.
 */
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred.';
  const code = err.code || 'INTERNAL_ERROR';

  logger.error(`[${req.method} ${req.path}] ${message}`, {
    statusCode,
    code,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'An internal server error occurred.' : message,
    code,
  });
};

/** Create a typed application error */
export function createError(
  message: string,
  statusCode: number,
  code?: string
): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

/** Handle 404 for unknown routes */
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
    code: 'NOT_FOUND',
  });
};
