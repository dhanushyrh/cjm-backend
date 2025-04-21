import { Response } from 'express';
import logger from '../config/logger';

export interface ApiErrorOptions {
  status?: number;
  message: string;
  details?: any;
  source?: Error;
}

/**
 * Handles API errors and sends a standardized error response
 * @param res Express response object
 * @param options Error options including status code, message, and details
 */
export const apiError = (res: Response, options: ApiErrorOptions): void => {
  const { status = 500, message, details, source } = options;
  
  // Log the error
  if (source) {
    logger.error(message, source);
  } else {
    logger.error(message, details);
  }
  
  // Send standardized response
  res.status(status).json({
    success: false,
    error: {
      message,
      ...(details ? { details } : {})
    }
  });
};

/**
 * Handles API validation errors and sends a standardized error response
 * @param res Express response object
 * @param errors Validation errors
 */
export const apiValidationError = (res: Response, errors: any): void => {
  apiError(res, {
    status: 400,
    message: 'Validation error',
    details: errors
  });
};

/**
 * Handles API successful responses
 * @param res Express response object
 * @param data Data to send
 * @param message Optional success message
 */
export const apiSuccess = (res: Response, data: any, message?: string): void => {
  res.json({
    success: true,
    ...(message ? { message } : {}),
    data
  });
};

// This file serves as a case-insensitive alias for ApiError.ts
