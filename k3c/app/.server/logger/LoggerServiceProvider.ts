import { WinstonLoggerService } from './impl/WinstonLoggerService';
import type { LoggerService } from './LoggerService';

const logger: LoggerService & { setLogLevel(level: string): void } =
  new WinstonLoggerService();

export default logger;
