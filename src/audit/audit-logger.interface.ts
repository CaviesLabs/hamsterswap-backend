import { LogData } from './entities/trail.entity';

export interface IAuditLogger {
  log(data: LogData): void;
}
