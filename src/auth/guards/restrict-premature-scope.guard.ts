import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PrematureAuthSession } from '../strategies/premature-auth.strategy';
import { PreMatureScope } from '../entities/auth-session.entity';

/**
 * @dev Declare guard that restricts jwt session type.
 */
@Injectable()
export class RestrictPrematureScopeGuard implements CanActivate {
  /**
   * @dev Initialize the guard.
   * @param reflector
   */
  constructor(private reflector: Reflector) {}

  /**
   * @dev Main handler for the guard.
   * @param context
   */
  public canActivate(context: ExecutionContext): boolean {
    /**
     * @dev Extract the session type from metadata.
     */
    const scopes = this.reflector.get<PreMatureScope[]>(
      'scopes',
      context.getHandler(),
    );

    /**
     * @dev If no session types declared, we allow the request.
     */
    if (scopes.length === 0) {
      return true;
    }

    /**
     * @dev Extract the request session.
     */
    const request = context.switchToHttp().getRequest();
    const { session } = request.user as PrematureAuthSession;

    /**
     * @dev If the request was issued properly, we allow the request.
     */
    return scopes.filter((scope) => session.scopes.includes(scope)).length > 0;
  }
}
