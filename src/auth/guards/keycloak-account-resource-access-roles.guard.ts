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
export enum Role {
  MANAGE_ACCOUNT = 'manage-account',
  VIEW_PROFILE = 'view-profile', // can be redundant
}

/**
 * @dev Define account resource access roles guard.
 */
@Injectable()
export class KeycloakAccountResourceAccessRolesGuard implements CanActivate {
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
     * @dev Extract roles from metadata.
     */
    const roles = this.reflector.get<Role[]>('roles', context.getHandler());

    /**
     * @dev If no roles defined, pass.
     */
    if (!roles) {
      return true;
    }

    /**
     * @dev Extract request session.
     */
    const request = context.switchToHttp().getRequest();
    const session = request.user as KeycloakAuthSession;

    /**
     * @dev Introspect auth jwt.s
     */
    const jwtData = await this.openIDProvider.instance.introspect(
      session.token,
    );

    /**
     * @dev Return matched role with metadata.
     */
    return (
      roles.filter(
        (role) =>
          (jwtData.resource_access as any)?.account?.roles.indexOf(role) !== -1,
      ).length > 0
    );
  }
}
