import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuditLoggerContextMap } from './audit-logger.service';
/**
 * @dev Blind guard for initiate logger
 */
@Injectable()
export class AuditGuard implements CanActivate {
  constructor(private readonly contextMap: AuditLoggerContextMap) {}
  canActivate(context: ExecutionContext): boolean {
    /**
     * @dev Extract request Id
     */
    let requestId: string;
    switch (context.getType()) {
      case 'ws':
        requestId = context.switchToWs().getClient<Socket>().id;
        break;
      default:
        requestId = context.switchToHttp().getRequest().id;
        break;
    }
    /**
     * @dev Initialize audit log instance
     */
    const auditLogger = this.contextMap.getOrCreate(requestId);
    /**
     * @dev Bind execution context
     */
    auditLogger.bindExecutionContext(context);
    /**
     * @dev Alway pass
     */
    return true;
  }
}
