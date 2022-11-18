import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * @dev Import deps
 */
import { KeycloakAuthSession } from '../strategies/keycloak-auth.strategy';
import { OpenIDProvider } from '../../providers/federated-users/openid.provider';

/**
 * @dev Define roles.
 */
export enum Scope {
  PROFILE = 'profile',
  EMAIL = 'email',
  GROUP = 'group',
  ROLES = 'roles',
}

/**
 * @dev Define account scope verifier.
 */
@Injectable()
export class KeycloakAccountScopeGuard implements CanActivate {
  /**
   * @dev Constructor initializes `KeycloakAccountResourceAccessRolesGuard`
   * @param openIDProvider
   * @param reflector
   */
  constructor(
    private openIDProvider: OpenIDProvider,
    private reflector: Reflector,
  ) {}

  /**
   * @dev Define guard logic.
   * @param context
   */
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    /**
     * @dev Extract scopes from metadata
     */
    const scopes = this.reflector.get<Scope[]>('scopes', context.getHandler());

    /**
     * @dev If no scopes was declared, pass.
     */
    if (!scopes) {
      return true;
    }

    /**
     * @dev Extract request session.
     */
    const request = context.switchToHttp().getRequest();
    const session = request.user as KeycloakAuthSession;

    /**
     * @dev Introspect session token.
     */
    const jwtData = await this.openIDProvider.instance.introspect(
      session.token,
    );

    /**
     * @dev Filter scope.
     */
    return (
      scopes.filter((scope) => (jwtData.scope as string).includes(scope))
        .length > 0
    );
  }
}
