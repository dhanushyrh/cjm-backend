/**
 * Logger utility 
 * This is a wrapper around the Winston logger for better type checking and consistent logging
 */

import winstonLogger from './winston';

const logger = {
  info: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'test') {
      winstonLogger.info(message, ...args);
    }
  },
  
  error: (message: string, error?: any) => {
    if (process.env.NODE_ENV !== 'test') {
      winstonLogger.error(message, error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'test') {
      winstonLogger.warn(message, ...args);
    }
  },
  
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      winstonLogger.debug(message, ...args);
    }
  }
};

export default logger; 