import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { JwtAuthSession } from '../strategies/premature-auth.strategy';

/**
 * @dev Declare allowed requested resources.
 */
export enum AllowedResource {
  ACCOUNT = 'account',
}

/**
 * @dev Declare guard that restricts jwt request resource.
 */
@Injectable()
export class RestrictPrematureRequestedResourceGuard implements CanActivate {
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
     * @dev Extract the resources type from metadata.
     */
    const resources = this.reflector.get<AllowedResource[]>(
      'resource',
      context.getHandler(),
    );

    /**
     * @dev If no resources types declared, we allow the request.
     */
    if (resources.length === 0) {
      return true;
    }

    /**
     * @dev Extract the request session.
     */
    const request = context.switchToHttp().getRequest();
    const { jwtPayload } = request.user as JwtAuthSession;

    /**
     * @dev If the request was issued properly, we allow the request.
     */
    return (
      resources.filter((resource) => resource === jwtPayload.aud).length > 0
    );
  }
}
