import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import * as ms from 'ms';

/**
 * @dev import models.
 */
import {
  AuthSessionDocument,
  AuthSessionModel,
} from '../../orm/model/auth-session.model';

/**
 * @dev Import infra providers
 */
import { JWTPayload, JwtProvider } from '../../providers/hash/jwt.provider';
import {
  PreMatureAuthSessionEntity,
  GrantType,
  SessionType,
  PreMatureScope,
} from '../entities/auth-session.entity';
import { RegistryProvider } from '../../providers/registry.provider';
import { UtilsProvider } from '../../providers/utils.provider';
import {
  ExtendedSessionModel,
  ExtendedSessionDocument,
} from '../../orm/model/extended-session.model';
import { SessionDistributionType } from '../entities/extended-session.entity';
import { KeycloakUserProvider } from '../../providers/federated-users/keycloak-user.provider';
import { TokenSetEntity } from '../entities/token-set.entity';
import { OpenIDProvider } from '../../providers/federated-users/openid.provider';
import { WalletScope } from '../guards/keycloak-authorization-permission-scope.guard';
import { AuthSessionService } from './auth-session.service';

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
  scopes: PreMatureScope[];
  enabledIdpId?: string;
}

/**
 * @dev Reset password config for issuer service.
 */
export interface PreMatureGrantAccessTokenOptions {
  actorId: string;
  enabledIdpId?: string;
}

/**
 * @dev Grant direct access token.
 */
export interface DirectKeycloakGrantAccessTokenOptions {
  email: string;
  password: string;
}

/**
 * @dev Google access token.
 */
export interface GoogleKeycloakGrantAccessTokenOptions {
  accessToken: string;
}

/**
 * @dev Grant access token with wallet upgraded permission.
 */
export interface WalletKeycloakAccessTokenOptions {
  currentAccessToken: string;
  walletScope: WalletScope;
}

/**
 * @dev Impersonating access token.
 */
export interface ImpersonatingKeycloakAccessTokenOptions {
  keycloakUserId: string;
  enabledIdpId?: string;
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
    /**
     * @dev Inject connection interface
     */
    @InjectConnection() private readonly connection: mongoose.Connection,

    /**
     * @dev Inject models
     */
    @InjectModel(AuthSessionModel.name)
    private readonly AuthSessionDocument: Model<AuthSessionDocument>,
    @InjectModel(ExtendedSessionModel.name)
    private readonly ExtendedSessionDocument: Model<ExtendedSessionDocument>,

    /**
     * @dev Providers
     */
    private readonly jwtProvider: JwtProvider,
    private readonly registryProvider: RegistryProvider,
    private readonly keycloakUserProvider: KeycloakUserProvider,
    private readonly openIdProvider: OpenIDProvider,

    /**
     * @dev Inject providers
     */
    private readonly sessionService: AuthSessionService,
  ) {}

  /**
   * @dev The function to generate access jwt.
   * @param config
   */
  async grantPreMatureAccessToken(config: AccessTokenConfig): Promise<string> {
    /**
     * @dev Should wrap whole process in a transaction.
     */
    const dbSession = await this.connection.startSession();
    await dbSession.startTransaction();

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
    const authSessionPayload: PreMatureAuthSessionEntity = {
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
     * @dev Create session here.
     */
    const sessionObj = new this.AuthSessionDocument(authSessionPayload);
    const session = await sessionObj.save();

    /**
     * @dev Also map the extended session
     */
    const extendedSession = new this.ExtendedSessionDocument({
      userId: config.actorId,
      sessionOrigin: session._id,
      distributionType: SessionDistributionType.PreMature,
      enabledIdpId: config.enabledIdpId,
    });
    await extendedSession.save();

    /**
     * @dev End transaction.
     */
    await dbSession.commitTransaction();
    await dbSession.endSession();

    /**
     * @dev Construct jwt payload.
     */
    const payload: JWTPayload = {
      /**
       * @dev Fields to be verified
       */
      jti: session._id.toString(),
      sid: session._id.toString(),
      sub: checksum,
      scope: config.scopes.join(' '),
      azp: config.authorizedPartyId,
      aud: config.requestedResource,
      exp: parseInt((sessionExpiresAt.getTime() / 1000).toString()),
      iss: this.registryProvider.getConfig().KEYCLOAK_AUTH_PASSPORT_CLIENT_ID,
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
      issuer:
        this.registryProvider.getConfig().KEYCLOAK_AUTH_PASSPORT_CLIENT_ID,
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
   * @dev Grant reset password access token.
   * @param options
   */
  public async grantResetPasswordAccessToken(
    options: PreMatureGrantAccessTokenOptions,
  ): Promise<string> {
    return this.grantPreMatureAccessToken({
      /**
       * @dev Scope will be verified by the guards.
       */
      scopes: [PreMatureScope.ResetPassword],

      /**
       * @dev Will be verified by jwt-auth strategy.
       */
      actorId: options.actorId,
      expiresIn: '5m',
      authorizedPartyId:
        this.registryProvider.getConfig().KEYCLOAK_AUTH_PASSPORT_CLIENT_ID,

      /**
       * @dev Will be verified via guards.
       */
      grantType: GrantType.Account,
      sessionType: SessionType.Direct,
      requestedResource: 'account',
    });
  }

  /**
   * @dev Refresh keycloak access token.
   * @param options
   */
  public async refreshKeycloakAccessToken(
    options: RefreshKeycloakAccessTokenOptions,
  ): Promise<TokenSetEntity> {
    /**
     * @dev Calling service. No need to extend keycloak session since this is just the refresh session.
     */
    return this.keycloakUserProvider.refreshToken(options.currentRefreshToken);
  }

  /**
   * @dev Grant verify email access token.
   * @param options
   */
  public async grantVerifyEmailAccessToken(
    options: PreMatureGrantAccessTokenOptions,
  ): Promise<string> {
    return this.grantPreMatureAccessToken({
      /**
       * @dev Scope will be verified by the guards.
       */
      scopes: [PreMatureScope.VerifyEmail],

      /**
       * @dev Will be verified by jwt-auth strategy.
       */
      actorId: options.actorId,
      expiresIn: '5m',
      authorizedPartyId:
        this.registryProvider.getConfig().KEYCLOAK_AUTH_PASSPORT_CLIENT_ID,

      /**
       * @dev Will be verified via guards.
       */
      grantType: GrantType.Account,
      sessionType: SessionType.Direct,
      requestedResource: 'account',
    });
  }

  /**
   * @dev Grant direct keycloak access token.
   * @param options
   */
  public async grantKeycloakDirectAccessToken(
    options: DirectKeycloakGrantAccessTokenOptions,
  ): Promise<TokenSetEntity> {
    /**
     * @dev Create token session first.
     */
    const tokenSetEntity = await this.keycloakUserProvider.signIn(
      options.email,
      options.password,
    );

    /**
     * @dev Extend Keycloak session.
     */
    await this.sessionService.extendKeycloakSession(
      tokenSetEntity.access_token,
      {},
    );

    /**
     * @dev Return result.
     */
    return tokenSetEntity;
  }

  /**
   * @dev Grant impersonating keycloak access token.
   * @param options
   */
  public async grantImpersonatingKeycloakAccessToken(
    options: ImpersonatingKeycloakAccessTokenOptions,
  ): Promise<TokenSetEntity> {
    /**
     * @dev Create token session first.
     */
    const tokenSetEntity = await this.keycloakUserProvider.impersonate(
      options.keycloakUserId,
    );

    /**
     * @dev Extend Keycloak session.
     */
    await this.sessionService.extendKeycloakSession(
      tokenSetEntity.access_token,
      { enabledIdpId: options.enabledIdpId },
    );

    /**
     * @dev Return result.
     */
    return tokenSetEntity;
  }

  /**
   * @dev Grant keycloak wallet access token.
   * @param options
   */
  public async grantKeycloakWalletAccessToken(
    options: WalletKeycloakAccessTokenOptions,
  ): Promise<TokenSetEntity> {
    /**
     * @dev Calling service. No need to extend keycloak session since this is just the upgrade session.
     */
    return this.keycloakUserProvider.requestWalletPermission(
      options.currentAccessToken,
      options.walletScope,
    );
  }

  /**
   * @dev Introspect jwt token.
   * @param jwtToken
   */
  public async introspect(jwtToken: string): Promise<JWTPayload> {
    let response;

    try {
      /**
       * @dev Default we introspect premature jwt first.
       */
      response = await this.jwtProvider.introspect(jwtToken);
    } catch {
      /**
       * @dev If the premature one isn't able to verify, try introspecting as a keycloak token.
       */
      response = await this.openIdProvider.instance.introspect(jwtToken);
    }

    return response;
  }
}
