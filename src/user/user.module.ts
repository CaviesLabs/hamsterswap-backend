import { Module } from '@nestjs/common';

import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { StorageProvider } from '../providers/s3.provider';
import { ClientUserController } from './controllers/client-user.controller';
import { OrmModule } from '../orm/orm.module';
import { NetworkProvider } from '../providers/network.provider';
import { RegistryProvider } from '../providers/registry.provider';
import { IdpController } from './controllers/idp.controller';
import { AuthChallengeService } from '../auth/services/auth-challenge.service';
import { TokenIssuerService } from '../auth/services/token-issuer.service';
import { JwtProvider } from '../providers/hash/jwt.provider';
import { IdpResourceBuilder } from './factories/idp-resource.builder';
import { IdpResourceService } from './services/idp-resource.service';
import { IdpAuthService } from '../auth/services/idp-auth.service';
import { AuthSessionService } from '../auth/services/auth-session.service';
import { IdpAuthBuilder } from '../auth/factories/idp-auth.builder';
import { JwtAuthStrategy } from '../auth/strategies/premature-auth.strategy';
import { CookieProvider } from '../providers/cookie.provider';

@Module({
  /**
   * @dev Import modules
   */
  imports: [OrmModule],
  /**
   * @dev Import controllers.
   */
  controllers: [UserController, IdpController, ClientUserController],
  /**
   * @dev Import providers
   */
  providers: [
    /**
     * @dev Import services
     */
    UserService,
    AuthChallengeService,
    TokenIssuerService,
    IdpAuthService,
    IdpResourceBuilder,
    IdpResourceService,
    AuthSessionService,
    IdpAuthBuilder,

    /**
     * @dev Import providers
     */
    RegistryProvider,
    StorageProvider,
    NetworkProvider,
    JwtProvider,
    CookieProvider,

    /**
     * @dev Import strategies
     */
    JwtAuthStrategy,
    /**
     * @dev Import guards.
     */
  ],
})
export class UserModule {}
