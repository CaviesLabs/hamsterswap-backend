import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Socket } from 'socket.io';

import { AuditLoggerContextMap } from './audit-logger.service';

/**
 * @dev Interceptor for update user activity
 */
@Injectable()
export class AuditActivityInterceptor implements NestInterceptor {
  constructor(private readonly contextMap: AuditLoggerContextMap) {}

  /**
   * @dev Intercept method
   * @param context
   * @param next
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
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
     * @dev Initialize audit log instance and bind execution context.
     */
    const auditLogger = this.contextMap.getOrCreate(requestId);
    auditLogger.bindExecutionContext(context);

    /**
     * @dev Pipe actions
     */
    return next.handle().pipe(
      /**
       * @dev Update user activity
       */
      tap(async () => {
        /**
         * @dev Last called point, should cleanup
         */
        await auditLogger.updateUserActivity();
        this.contextMap.cleanup(requestId);
      }),
    );
  }
}
