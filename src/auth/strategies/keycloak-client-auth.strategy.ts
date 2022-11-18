import { Injectable, Request, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { FastifyRequest } from 'fastify';
import type { IntrospectionResponse } from 'openid-client';

import { OpenIDProvider } from '../../providers/federated-users/openid.provider';
import { UtilsProvider } from '../../providers/utils.provider';
import { UserEntity } from '../../user/entities/user.entity';
import { RegistryProvider } from '../../providers/registry.provider';

/**
 * @dev Define auth strategy key.
 */
const KeycloakClientAuthStrategyKey = 'keycloak-key-auth';

/**
 * @dev authed request session.
 */
export class KeycloakAuthSession {
  user: UserEntity;
  token: string;
  tokenPayload: IntrospectionResponse;
}

/**
 * @dev Declare authorized parties.
 */
export enum AllowedAuthorizedParty {
  Hamsterprise = 'hamsterprise',
  Hamsterbridge = 'hamsterbridge',
  Hamsterportal = 'hamsterportal',
  Hamsterpassport = 'hamsterpassport',
  Hamstermarket = 'hamstermarket',
}
export const AllowedAuthorizedParties = [
  AllowedAuthorizedParty.Hamsterbridge,
  AllowedAuthorizedParty.Hamsterportal,
  AllowedAuthorizedParty.Hamsterprise,
  AllowedAuthorizedParty.Hamsterpassport,
  AllowedAuthorizedParty.Hamstermarket,
];

/**
 * @dev Define a Keycloak-based passport strategy.
 */
@Injectable()
export class KeycloakClientAuthStrategy extends PassportStrategy(
  Strategy,
  KeycloakClientAuthStrategyKey,
) {
  /**
   * @dev Binding static key.
   */
  static key = KeycloakClientAuthStrategyKey;

  /**
   * @dev Constructor initializes the strategy
   * @param registryProvider
   * @param openIDProvider
   */
  constructor(
    private registryProvider: RegistryProvider,
    private openIDProvider: OpenIDProvider,
  ) {
    super();
  }

  /**
   * @dev Authenticate JWT and return the user object.
   * @param authJwt
   * @private
   */
  private async authenticateSession(
    authJwt: string,
  ): Promise<KeycloakAuthSession> {
    /**
     * @dev Using JWT to request resource user from keycloak. Which means to:
     * 1) validate the JWT whether it has been signed by keycloak (our auth)
     * 2) return the authenticated user.
     * 3) other than two above conditions, raise unauthorized error.
     */
    const user = await new UtilsProvider().overrideErrorWrap<UserEntity>(
      () => this.openIDProvider.instance.userinfo<UserEntity>(authJwt),
      {
        exceptionClass: UnauthorizedException,
      },
    );

    /**
     * @dev Introspect JWT payload.
     */
    const jwtPayload = await this.openIDProvider.instance.introspect(authJwt);

    const hamsterPassportID =
      this.registryProvider.getConfig().KEYCLOAK_AUTH_PASSPORT_CLIENT_ID;

    /**
     * @dev To make sure the JWT was issued only for allowed authorized parties.
     * 1) azp field must match the client id
     * 2) otherwise raise unauthorized error.
     */
    if (!AllowedAuthorizedParties.find((party) => party === jwtPayload.azp)) {
      throw new UnauthorizedException();
    }

    /**
     * @dev To make sure the JWT was issued for `account` audience.
     * 1) `aud` field must be `account` or `hamsterpassport`
     * 2) otherwise raise unauthorized error.
     */
    if (jwtPayload.aud !== 'account' && jwtPayload.aud !== hamsterPassportID) {
      throw new UnauthorizedException();
    }

    /**
     * @dev To make sure the clientId matched with authorized party
     */
    if (jwtPayload.azp !== jwtPayload.client_id) {
      throw new UnauthorizedException();
    }

    return { user, token: authJwt, tokenPayload: jwtPayload };
  }

  /**
   * @dev Validate the request.
   * @param req
   */
  public async validate(
    @Request() req: FastifyRequest,
  ): Promise<{ user: UserEntity }> {
    const auth = req.headers['authorization'] as string;

    if (!auth) {
      throw new UnauthorizedException();
    }

    const authJWT = auth.replace('Bearer ', '');
    return this.authenticateSession(authJWT);
  }
}
