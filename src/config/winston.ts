import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, errors } = format;

// Define log directory
const logDir = process.env.LOG_DIR || 'logs';

// Custom format for console and file logs
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

// Create a daily rotate file transport for error logs
const errorFileTransport = new transports.DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error',
});

// Create a daily rotate file transport for combined logs
const combinedFileTransport = new transports.DailyRotateFile({
  filename: path.join(logDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
});

// Create different transports based on environment
const getTransports = () => {
  const transportsList: winston.transport[] = [
    new transports.Console({
      format: combine(
        colorize(),
        consoleFormat
      )
    })
  ];

  // Only add file transports in production
  if (process.env.NODE_ENV === 'production') {
    transportsList.push(errorFileTransport, combinedFileTransport);
  }

  return transportsList;
};

// Create the logger
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    consoleFormat
  ),
  transports: getTransports(),
  exitOnError: false
});

// Stream for Morgan integration
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

export default logger; 