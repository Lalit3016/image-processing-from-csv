import { format, createLogger, transports } from 'winston';
const { timestamp, combine, printf, errors, json, metadata, colorize, splat } = format;

function buildDevLogger() {
  const logFormat = printf(({ level, message, timestamp, stack, metadata }) => {
    const metadataContent =
      typeof metadata === 'object' && metadata !== null && 'metadata' in metadata
        ? JSON.stringify((metadata as { metadata: unknown }).metadata)
        : '';

    return `${timestamp} ${level}: ${stack || message} ${metadataContent}`;
  });

  return createLogger({
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
      errors({ stack: true }),
      logFormat,
    ),
    transports: [new transports.Console()],
    level: 'debug',
  });
}

function buildProdLogger() {
  return createLogger({
    format: combine(timestamp(), errors({ stack: true }), json()),
    defaultMeta: { service: 'user-service' }, // TODO: Change this
    transports: [new transports.Console()],
  });
}

let logger = buildProdLogger();
if (process.env.NODE_ENV === 'development') {
  logger = buildDevLogger();
}

export default logger;
