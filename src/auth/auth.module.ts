import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';

/**
 * @dev Import infra providers.
 */
import { AuthController } from './controllers/auth.controller';
import { StorageProvider } from '../providers/s3.provider';
import { JwtProvider } from '../providers/hash/jwt.provider';
import { OrmModule } from '../orm/orm.module';

/**
 * @dev Import logic providers.
 */
import { UserService } from '../user/services/user.service';
import { TokenIssuerService } from './services/token-issuer.service';
import { BCryptHashProvider } from '../providers/hash/hashing.provider';
import { EmailProvider } from '../providers/email.provider';
import { JwtAuthStrategy } from './strategies/premature-auth.strategy';
import { CookieProvider } from '../providers/cookie.provider';
import { OtpProvider } from '../providers/two-factors/otp.provider';
import { NetworkProvider } from '../providers/network.provider';
import { RegistryProvider } from '../providers/registry.provider';
import { AuthChallengeService } from './services/auth-challenge.service';
import { AuthSessionService } from './services/auth-session.service';
import { RestrictScopeGuard } from './guards/restrict-scope.guard';
import { IdpAuthController } from './controllers/idp-auth.controller';
import { AuthSessionController } from './controllers/auth-session.controller';
import { IdpResourceBuilder } from '../user/factories/idp-resource.builder';
import { IdpResourceService } from '../user/services/idp-resource.service';
import { IdpAuthBuilder } from './factories/idp-auth.builder';
import { IdpAuthService } from './services/idp-auth.service';

@Module({
  controllers: [AuthController, AuthSessionController, IdpAuthController],
  imports: [
    /**
     * @dev import ORM modules so that we can use models.
     */
    OrmModule,
    /**
     * @dev Configure nestjs passport jwt module.
     */
    JwtModule.registerAsync({
      /**
       * @dev Define module factory.
       */
      useFactory: async () => {
        /**
         * @dev Use jwtService to extract metadata.
         */
        const jwtService = new JwtProvider(new RegistryProvider());

        /**
         * @dev Binding credentials for jwt signing and verifying.
         */
        const options: JwtModuleOptions = {
          secret: jwtService.getKeyPair().privateKey,
          privateKey: jwtService.getKeyPair().privateKey,
          publicKey: jwtService.getKeyPair().publicKey,
          signOptions: jwtService.getSignOptions(),
        };

        /**
         * @dev return options.
         */
        return options;
      },
    }),
  ],
  providers: [
    /**
     * @dev Import services
     */
    TokenIssuerService,
    UserService,
    AuthChallengeService,
    AuthSessionService,
    IdpAuthBuilder,
    IdpAuthService,
    IdpResourceService,
    IdpResourceBuilder,

    /**
     * @dev Import providers.
     */
    RegistryProvider,
    StorageProvider,
    JwtProvider,
    BCryptHashProvider,
    EmailProvider,
    CookieProvider,
    OtpProvider,
    NetworkProvider,

    /**
     * @dev Import strategy
     */
    JwtAuthStrategy,

    /**
     * @dev Import guards.
     */
    RestrictScopeGuard,
  ],
})
export class AuthModule {}
