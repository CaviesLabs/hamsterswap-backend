import { Injectable } from '@nestjs/common';

/**
 * @dev Import deps
 */
import type { TokenSetEntity } from '../../auth/entities/token-set.entity';
import type { UpdateUserDto } from '../../user/dto/update-user.dto';
import type { WalletScope } from '../../auth/guards/keycloak-authorization-permission-scope.guard';
import { UserEntity } from '../../user/entities/user.entity';
import { OpenIDProvider } from './openid.provider';
import { KeycloakAdminProvider } from './keycloak-admin.provider';
import { RegistryProvider } from '../registry.provider';

/**
 * @dev Keycloak External identity provider.
 */
export enum ExternalIdentityProvider {
  GOOGLE = 'google',
}

/**
 * @dev Declare user payload on update.
 */
interface UpdateUserPayload {
  username?: string;
  firstName?: string;
  lastName?: string;
  attributes?: Partial<UpdateUserDto>;
  emailVerified?: boolean;
}

/**
 * @dev Keycloak user provider, leverage OpenID provider.
 */
@Injectable()
export class KeycloakUserProvider {
  constructor(
    /**
     * @dev Import providers
     */
    private readonly openIDProvider: OpenIDProvider,
    private readonly keycloakAdminProvider: KeycloakAdminProvider,
    private readonly registryProvider: RegistryProvider,
  ) {}

  /**
   * @dev Request authorization permission.
   * Please see reference: https://www.keycloak.org/docs/latest/authorization_services/index.html#_service_overview
   */
  public requestWalletPermission(authJwt: string, walletScope: WalletScope) {
    /**
     * @dev Build parameters.
     */
    const body = new URLSearchParams();
    body.append('grant_type', 'urn:ietf:params:oauth:grant-type:uma-ticket');
    body.append(
      'audience',
      this.registryProvider.getConfig().KEYCLOAK_AUTH_PASSPORT_CLIENT_ID,
    );
    body.append('permission', `wallet#${walletScope}`);

    /**
     * @dev Request resource.
     */
    return this.openIDProvider.requestResource<TokenSetEntity>(
      {
        resourceName: `protocol/openid-connect/token`,
      },
      authJwt,
      body.toString(),
      {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
      },
    );
  }

  /**
   * @dev Sign user with username and password.
   * @param username
   * @param password
   */
  public signIn(username: string, password: string): Promise<TokenSetEntity> {
    return this.openIDProvider.instance.grant({
      grant_type: 'password',
      username,
      password,
    });
  }

  /**
   * @dev Impersonate user, used with other options to sign user in.
   * @param userId
   */
  public impersonate(userId: string): Promise<TokenSetEntity> {
    return this.openIDProvider.impersonateAccount(userId);
  }

  /**
   * @dev Get user profile.
   * @param accessToken
   */
  public getUserProfile(accessToken: string): Promise<UserEntity> {
    return this.openIDProvider.instance.userinfo<UserEntity>(accessToken);
  }

  /**
   * @dev Refresh user access token with refresh token.
   * @param refreshToken
   */
  public refreshToken(refreshToken: string): Promise<TokenSetEntity> {
    return this.openIDProvider.instance.refresh(refreshToken);
  }

  /**
   * @dev Update user profile by using openID request resource function.
   * @param accessToken
   * @param payload
   */
  public async updateUserProfile(
    accessToken: string,
    payload: UpdateUserPayload,
  ): Promise<UserEntity> {
    const user = await this.getUserProfile(accessToken);

    /**
     * @dev Update user profile data.
     */
    await this.keycloakAdminProvider.instance.users.update(
      { id: user.sub },
      payload,
    );

    return this.getUserProfile(accessToken);
  }

  /**
   * @dev To add user to correct gamer group
   * @param userId
   * @param groupId
   * @private
   */
  private async tryToAddUserToGroup(
    userId: string,
    groupId: string,
  ): Promise<void> {
    /**
     * @dev Check if user was already joined the group.
     */
    const groups = await this.keycloakAdminProvider.instance.users.listGroups({
      id: userId,
      briefRepresentation: true,
    });

    /**
     * @dev Add user to group
     */
    if (!groups.map((group) => group.id).includes(groupId)) {
      /**
       * @dev Add user to group if necessary.
       */
      await this.keycloakAdminProvider.instance.users.addToGroup({
        id: userId,
        groupId: groupId,
      });
    }
  }
}
