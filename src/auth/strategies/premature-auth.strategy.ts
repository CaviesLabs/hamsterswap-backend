import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

/**
 * @dev Import deps.
 */
import { JWTPayload, JwtProvider } from '../../providers/hash/jwt.provider';
import { CookieProvider } from '../../providers/cookie.provider';
import { RegistryProvider } from '../../providers/registry.provider';
import { ExtendedSessionModel } from '../../orm/model/extended-session.model';
import { SessionDistributionType } from '../entities/extended-session.entity';
import { AuthSessionService } from '../services/auth-session.service';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { AuthSessionModel } from '../../orm/model/auth-session.model';
import { UserModel } from '../../orm/model/user.model';
import { Repository } from 'typeorm';

/**
 * @dev Declare the application native jwt auth session.
 */
export type JwtAuthSession = {
  user: UserEntity;
  session: AuthSessionModel;
  jwtPayload: JWTPayload;
};

/**
 * @dev Declare the Jwt Passport strategy.
 */
@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  /**
   * @dev Initialize passport strategy.
   * @param jwtOptions
   * @param cookieService
   * @param keycloakAdminProvider
   * @param userService
   * @param authService
   * @param registryProvider
   * @param authenticationService
   * @param sessionService
   * @param ExtendedSessionRepo
   */
  constructor(
    /**
     * @dev Import providers
     */
    private readonly jwtOptions: JwtProvider,
    private readonly cookieService: CookieProvider,
    private readonly registryProvider: RegistryProvider,

    /**
     * @dev Import services
     */
    private readonly sessionService: AuthSessionService,

    /**
     * @dev Import models
     */
    @InjectRepository(ExtendedSessionModel)
    private readonly ExtendedSessionRepo: Repository<ExtendedSessionModel>,
    @InjectRepository(UserModel)
    private readonly UserRepo: Repository<UserModel>,
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
  ): Promise<JwtAuthSession> {
    /**
     * @dev Make sure the jwt id matched with a session id.
     */
    const session = await this.sessionService.findAuthSessionById(
      jwtPayload.sid as string,
    );
    if (!session) throw new UnauthorizedException();

    /**
     * @dev Make sure the jwt was issued with premature type.
     */
    const extendedSession = await this.ExtendedSessionRepo.findOne({
      where: {
        distributionType: SessionDistributionType.PreMature,
        sessionOrigin: jwtPayload.sid as string,
      },
    });
    if (!extendedSession) throw new UnauthorizedException();

    /**
     * @dev Make sure the checksum is matched.
     */
    if (jwtPayload.sub !== session.checksum) throw new UnauthorizedException();

    /**
     * @dev Make sure the user existed in the keycloak database.
     */
    const user = await this.UserRepo.findOne({
      where: { id: session.actorId },
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
    if (jwtPayload.azp !== this.registryProvider.getConfig().DOMAIN) {
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
  validate(payload: JWTPayload): Promise<JwtAuthSession> {
    return this.validateJwtSession(payload);
  }
}
