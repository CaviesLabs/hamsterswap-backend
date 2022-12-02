import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import * as ms from 'ms';

/**
 * @dev import models.
 */
import { AuthSessionModel } from '../../orm/model/auth-session.model';

/**
 * @dev Import infra providers
 */
import { JWTPayload, JwtProvider } from '../../providers/hash/jwt.provider';
import {
  AuthSessionEntity,
  GrantType,
  SessionType,
  AuthScope,
} from '../entities/auth-session.entity';
import { RegistryProvider } from '../../providers/registry.provider';
import { UtilsProvider } from '../../providers/utils.provider';
import { ExtendedSessionModel } from '../../orm/model/extended-session.model';
import { SessionDistributionType } from '../entities/extended-session.entity';
import { TokenSetEntity } from '../entities/token-set.entity';

/**
 * @dev The payload for generating access.
 */
export interface AccessTokenConfig {
  requestedResource: string;
  actorId: string;
  authorizedPartyId: string;
  expiresIn: string;
  grantType: GrantType;
  sessionType: SessionType;
  scopes: AuthScope[];
  enabledIdpId: string;
}

/**
 * @dev Reset password config for issuer service.
 */
export interface GrantAccessTokenOptions {
  actorId: string;
  enabledIdpId: string;
}

/**
 * @dev Refreshing keycloak access token.
 */
export interface RefreshKeycloakAccessTokenOptions {
  currentRefreshToken: string;
}

/**
 * @dev Declare auth session service.
 */
@Injectable()
export class TokenIssuerService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    /**
     * @dev Inject models
     */
    @InjectRepository(AuthSessionModel)
    private readonly AuthSessionRepo: Repository<AuthSessionModel>,
    @InjectRepository(ExtendedSessionModel)
    private readonly ExtendedSessionRepo: Repository<ExtendedSessionModel>,

    /**
     * @dev Providers
     */
    private readonly jwtProvider: JwtProvider,
    private readonly registryProvider: RegistryProvider,
  ) {}

  /**
   * @dev The function to generate access jwt.
   * @param config
   */
  private async grantAccessToken(config: AccessTokenConfig): Promise<string> {
    /**
     * @dev Calculate expiry date.
     */
    const duration = Number(
      ms(
        config.expiresIn || String(this.jwtProvider.getSignOptions().expiresIn),
      ),
    );

    const sessionExpiresAt = new Date(new Date().getTime() + duration);

    /**
     * @dev Construct payload.
     */
    const authSessionPayload: AuthSessionEntity = {
      actorId: config.actorId,
      grantType: config.grantType,
      sessionType: config.sessionType,
      authorizedPartyId: config.authorizedPartyId,
      scopes: config.scopes,
      checksum: '',
      expiryDate: sessionExpiresAt,
    };

    /**
     * @dev Calculate checksum.
     */
    const checksum = await new UtilsProvider().generateChecksum(
      JSON.stringify(authSessionPayload),
    );
    authSessionPayload.checksum = checksum;
    /**
     * @dev Should wrap whole process in a transaction.
     */
    const session = await this.entityManager.transaction(async (em) => {
      /**
       * @dev Create session here.
       */
      const session = await em.save(AuthSessionModel, authSessionPayload);

      /**
       * @dev Also map the extended session
       */
      await em.save(ExtendedSessionModel, {
        userId: config.actorId,
        sessionOrigin: session.id,
        distributionType: SessionDistributionType.PreMature,
        enabledIdpId: config.enabledIdpId,
        lastActiveTime: new Date(),
      });

      return session;
    });

    /**
     * @dev Construct jwt payload.
     */
    const payload: JWTPayload = {
      /**
       * @dev Fields to be verified
       */
      jti: session.id,
      sid: session.id,
      sub: checksum,
      scope: config.scopes.join(' '),
      azp: config.authorizedPartyId,
      aud: config.requestedResource,
      exp: parseInt((sessionExpiresAt.getTime() / 1000).toString()),
      iss: this.registryProvider.getConfig().DOMAIN,
      dist: SessionDistributionType.PreMature,
      /**
       * @dev Other fields.
       */
      iat: parseInt((new Date().getTime() / 1000).toString()),
      typ: 'Bearer',
      nbf: parseInt((new Date().getTime() / 1000).toString()),
    };

    /**
     * @dev Finally sign and return the jwt.
     */
    const jwt = await this.jwtProvider.signJwt(payload);

    /**
     * @dev Verify jwt to make sure the jwt is valid.
     */
    const verifyResult = await this.jwtProvider.verifyJwt(jwt, {
      issuer: this.registryProvider.getConfig().DOMAIN,
      audience: config.requestedResource,
      currentDate: new Date(),
    });

    /**
     * @dev Raise error if cannot verify jwt.
     */
    if (!verifyResult) {
      throw new BadRequestException();
    }

    /**
     * @dev Return JWT
     */
    return jwt;
  }

  /**
   * @dev Grant verify email access token.
   * @param options
   */
  public async grantSignInAccessToken(
    options: GrantAccessTokenOptions,
  ): Promise<TokenSetEntity> {
    return {
      accessToken: await this.grantAccessToken({
        /**
         * @dev Scope will be verified by the guards.
         */
        scopes: [AuthScope.ReadProfile, AuthScope.WriteProfile],

        /**
         * @dev Will be verified by jwt-auth strategy.
         */
        actorId: options.actorId,
        expiresIn: '7d',
        authorizedPartyId: this.registryProvider.getConfig().DOMAIN,

        /**
         * @dev Will be verified via guards.
         */
        grantType: GrantType.Account,
        sessionType: SessionType.Direct,
        requestedResource: 'account',

        enabledIdpId: options.enabledIdpId,
      }),
    };
  }

  /**
   * @dev Introspect jwt token.
   * @param jwtToken
   */
  public async introspect(jwtToken: string): Promise<JWTPayload> {
    return this.jwtProvider.introspect(jwtToken);
  }
}
