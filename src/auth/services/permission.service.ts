import { Injectable } from '@nestjs/common';

import { WalletScope } from '../guards/keycloak-authorization-permission-scope.guard';
import { TokenIssuerService } from './token-issuer.service';

/**
 * @dev Permission service handles permission-related logic
 */
@Injectable()
export class PermissionService {
  /**
   * @dev Constructor initializes PermissionService.
   * @param tokenIssuerService
   */
  constructor(
    /**
     * @dev Inject providers
     */
    private readonly tokenIssuerService: TokenIssuerService,
  ) {}

  /**
   * @dev request an exchange code.
   * @param authJwt
   * @param walletScope
   */
  public requestWalletPermission(authJwt: string, walletScope: WalletScope) {
    return this.tokenIssuerService.grantKeycloakWalletAccessToken({
      currentAccessToken: authJwt,
      walletScope,
    });
  }
}
