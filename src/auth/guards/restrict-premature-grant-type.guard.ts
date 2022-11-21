import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { JwtAuthSession } from '../strategies/premature-auth.strategy';
import { GrantType } from '../entities/auth-session.entity';

/**
 * @dev Declare guard that restricts jwt grant type access.
 */
@Injectable()
export class RestrictPrematureGrantTypeGuard implements CanActivate {
  /**
   * @dev Declare constructor that initialize the guard.
   * @param reflector
   */
  constructor(private reflector: Reflector) {}

  /**
   * @dev Main handler for the guard.
   * @param context
   */
  public canActivate(context: ExecutionContext): boolean {
    /**
     * @dev Extract grant type from metadata first.
     */
    const grantTypes = this.reflector.get<GrantType[]>(
      'grantType',
      context.getHandler(),
    );

    /**
     * @dev Allow the request if no grant types declared.
     */
    if (grantTypes.length === 0) {
      return true;
    }

    /**
     * @dev Extract request session.
     */
    const request = context.switchToHttp().getRequest();
    const { session } = request.user as JwtAuthSession;

    /**
     * @dev If the grant type was issued for the right purpose, then we allow.
     */
    return (
      grantTypes.filter((grantType) => grantType === session.grantType).length >
      0
    );
  }
}
