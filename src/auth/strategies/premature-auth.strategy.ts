import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

/**
 * @dev Import deps.
 */
import { JWTPayload, JwtProvider } from '../../providers/hash/jwt.provider';
import { BCryptHashProvider } from '../../providers/hash/hashing.provider';
import { UserService } from '../../user/services/user.service';
import { AuthenticationService } from '../services/authentication.service';
import { CookieProvider } from '../../providers/cookie.provider';
import {
  KeycloakAdminProvider,
  UserFullEntity,
} from '../../providers/federated-users/keycloak-admin.provider';
import { AuthSessionDocument } from '../../orm/model/auth-session.model';
import { RegistryProvider } from '../../providers/registry.provider';
import {
  ExtendedSessionDocument,
  ExtendedSessionModel,
} from '../../orm/model/extended-session.model';
import { SessionDistributionType } from '../entities/extended-session.entity';
import { AuthSessionService } from '../services/auth-session.service';

/**
 * @dev Declare the application native jwt auth session.
 */
export interface PrematureAuthSession {
  user: UserFullEntity;
  session: AuthSessionDocument;
  jwtPayload: JWTPayload;
}

/**
 * @dev Declare the Jwt Passport strategy.
 */
@Injectable()
export class PreMatureAuthStrategy extends PassportStrategy(Strategy) {
  /**
   * @dev Initialize passport strategy.
   * @param jwtOptions
   * @param hashingService
   * @param cookieService
   * @param keycloakAdminProvider
   * @param userService
   * @param authService
   * @param registryProvider
   * @param authenticationService
   * @param sessionService
   * @param ExtendedSessionDocument
   */
  constructor(
    /**
     * @dev Import providers
     */
    private readonly jwtOptions: JwtProvider,
    private readonly hashingService: BCryptHashProvider,
    private readonly cookieService: CookieProvider,
    private readonly keycloakAdminProvider: KeycloakAdminProvider,
    private readonly registryProvider: RegistryProvider,

    /**
     * @dev Import services
     */
    private readonly userService: UserService,
    private readonly authService: AuthenticationService,
    private readonly authenticationService: AuthenticationService,
    private readonly sessionService: AuthSessionService,

    /**
     * @dev Import models
     */
    @InjectModel(ExtendedSessionModel.name)
    private readonly ExtendedSessionDocument: Model<ExtendedSessionDocument>,
  ) {
    /**
     * @dev Inherit parent class constructor.
     */
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieService.extractFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtOptions.getKeyPair().publicKey,
      algorithms: jwtOptions.getVerifyOptions().algorithms,
    });
  }

  /**
   * @dev Validate jwt session. Sub method.
   * @param jwtPayload
   * @private
   */
  private async validateJwtSession(
    jwtPayload: JWTPayload,
  ): Promise<PrematureAuthSession> {
    /**
     * @dev Make sure the jwt id matched with a session id.
     */
    const session = (await this.sessionService.findAuthSessionById(
      jwtPayload.sid as string,
    )) as AuthSessionDocument;
    if (!session) throw new UnauthorizedException();

    /**
     * @dev Make sure the jwt was issued with premature type.
     */
    const extendedSession = await this.ExtendedSessionDocument.findOne({
      distributionType: SessionDistributionType.PreMature,
      sessionOrigin: jwtPayload.sid as string,
    });
    if (!extendedSession) throw new UnauthorizedException();

    /**
     * @dev Make sure the checksum is matched.
     */
    if (jwtPayload.sub !== session.checksum) throw new UnauthorizedException();

    /**
     * @dev Make sure the user existed in the keycloak database.
     */
    const user = await this.keycloakAdminProvider.instance.users.findOne({
      id: session.actorId,
    });
    if (!user) throw new UnauthorizedException();

    /**
     * @dev Make sure the session is not expired
     */
    if (new Date().getTime() >= new Date(session.expiryDate).getTime()) {
      throw new UnauthorizedException();
    }

    /**
     * @dev Make sure the jwt was issued for the right authorized party.
     */
    if (
      jwtPayload.azp !==
      this.registryProvider.getConfig().KEYCLOAK_AUTH_PASSPORT_CLIENT_ID
    ) {
      throw new UnauthorizedException();
    }

    /**
     * @dev Then we can successfully validate the session.
     */
    return { session, user, jwtPayload };
  }

  /**
   * @dev Validate jwt session. Main method.
   * @param payload
   */
  validate(payload: JWTPayload): Promise<PrematureAuthSession> {
    return this.validateJwtSession(payload);
  }
}
