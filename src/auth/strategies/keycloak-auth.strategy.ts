import { Injectable, Request, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { FastifyRequest } from 'fastify';
import type { IntrospectionResponse } from 'openid-client';
import { Socket } from 'socket.io';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

/**
 * @dev Imports providers and deps
 */
import { OpenIDProvider } from '../../providers/federated-users/openid.provider';
import { UtilsProvider } from '../../providers/utils.provider';
import { RegistryProvider } from '../../providers/registry.provider';
import { UserEntity } from '../../user/entities/user.entity';
import { Scope } from '../guards/keycloak-account-scope.guard';
import { SessionDistributionType } from '../entities/extended-session.entity';
import {
  ExtendedSessionModel,
  ExtendedSessionDocument,
} from '../../orm/model/extended-session.model';

/**
 * @dev Define auth strategy key.
 */
const KeycloakAuthStrategyKey = 'keycloak-auth';

/**
 * @dev authed request session.
 */
export class KeycloakAuthSession {
  user: UserEntity;
  token: string;
  tokenPayload: IntrospectionResponse;
}

/**
 * @dev Define a Keycloak-based passport strategy.
 */
@Injectable()
export class KeycloakAuthStrategy extends PassportStrategy(
  Strategy,
  KeycloakAuthStrategyKey,
) {
  /**
   * @dev Binding static key.
   */
  static key = KeycloakAuthStrategyKey;

  /**
   * @dev Constructor initializes the strategy
   * @param registryProvider
   * @param openIDProvider
   * @param ExtendedSessionDocument
   */
  constructor(
    private registryProvider: RegistryProvider,
    private openIDProvider: OpenIDProvider,

    /**
     * @dev Import models
     */
    @InjectModel(ExtendedSessionModel.name)
    private readonly ExtendedSessionDocument: Model<ExtendedSessionDocument>,
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

    /**
     * @dev Make sure the jwt was issued with Keycloak type.
     */
    const extendedSession = await this.ExtendedSessionDocument.findOne({
      distributionType: SessionDistributionType.KeyCloak,
      sessionId: jwtPayload.sid,
    });
    if (!extendedSession) throw new UnauthorizedException();

    const authorizedParty =
      this.registryProvider.getConfig().KEYCLOAK_AUTH_PASSPORT_CLIENT_ID;

    /**
     * @dev To make sure the JWT was issued only for hamsterpassport.
     * 1) azp field must match the client id
     * 2) otherwise raise unauthorized error.
     */
    if (authorizedParty !== jwtPayload.azp) {
      throw new UnauthorizedException();
    }

    /**
     * @dev JWT could be issued as a string/an array. To make sure the JWT was issued for `account` audience.
     * 1) `aud` field must be `account` or `hamsterpassport`
     * 2) otherwise raise unauthorized error.
     */
    if (
      !!jwtPayload.aud &&
      !jwtPayload.aud.includes('account') &&
      !jwtPayload.aud.includes(authorizedParty)
    ) {
      throw new UnauthorizedException();
    }

    /**
     * @dev To make sure the JWT was issued with required scopes that passport API can function properly.
     * 1) Must contain `profile`, `group`, `roles` and `email`
     * 2) otherwise raise unauthorized error.
     */
    if (
      ![Scope.EMAIL, Scope.GROUP, Scope.PROFILE, Scope.ROLES].reduce(
        (accum, scope) => {
          return accum && jwtPayload.scope.includes(scope);
        },
        true,
      )
    ) {
      throw new UnauthorizedException();
    }

    return { user, token: authJwt, tokenPayload: jwtPayload };
  }

  /**
   * @dev Validate the request.
   * @param req
   */
  public async validate(
    @Request() req: FastifyRequest | Socket,
  ): Promise<{ user: UserEntity }> {
    /**
     * @dev Extract incoming HTTP request or Socket Handshake request for authorization header
     */
    let auth: string;
    if (req instanceof Socket) {
      auth = req.handshake.headers.authorization;
    } else {
      auth = req.headers.authorization;
    }

    if (!auth) {
      throw new UnauthorizedException();
    }

    const authJWT = auth.replace('Bearer ', '');
    return this.authenticateSession(authJWT);
  }
}
