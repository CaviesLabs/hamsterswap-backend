import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * @dev Import deps
 */
import { KeycloakAuthSession } from '../strategies/keycloak-auth.strategy';
import { OpenIDProvider } from '../../providers/federated-users/openid.provider';

/**
 * @dev Declare wallet scope.
 */
export enum WalletScope {
  WALLET_READ = 'read.scope.wallet',
  WALLET_WRITE = 'write.scope.wallet',
}

/**
 * @dev Define account resource access scopes guard.
 */
@Injectable()
export class KeycloakAuthorizationPermissionScopeGuard implements CanActivate {
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
     * @dev Extract scopes from metadata.
     */
    const scopes = this.reflector.get<WalletScope[]>(
      'scopes',
      context.getHandler(),
    );

    /**
     * @dev If no scopes defined, pass.
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
     * @dev Introspect auth jwt.
     */
    const jwtData = await this.openIDProvider.instance.introspect(
      session.token,
    );

    /**
     * @dev Return matched scope with metadata.
     */
    try {
      return (
        scopes.filter((scope) =>
          (jwtData.authorization as any).permissions.find((permission) => {
            return permission.scopes.includes(scope);
          }),
        ).length > 0
      );
    } catch {
      return false;
    }
  }
}
