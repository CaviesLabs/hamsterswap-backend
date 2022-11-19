import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';

/**
 * @dev Import infra providers.
 */
import { AuthenticationService } from './services/authentication.service';
import { AuthController } from './controllers/auth.controller';
import { ClientAuthController } from './controllers/client-auth.controlller';
import { KeycloakAdminProvider } from '../providers/federated-users/keycloak-admin.provider';
import { OpenIDProvider } from '../providers/federated-users/openid.provider';
import { StorageProvider } from '../providers/s3.provider';
import { KeycloakUserProvider } from '../providers/federated-users/keycloak-user.provider';
import { JwtProvider } from '../providers/hash/jwt.provider';
import { OrmModule } from '../orm/orm.module';
import { AccountPolicyModule } from '../account-policy/account-policy.module';

/**
 * @dev Import logic providers.
 */
import { KeycloakAccountResourceAccessRolesGuard } from './guards/keycloak-account-resource-access-roles.guard';
import { KeycloakAuthStrategy } from './strategies/keycloak-auth.strategy';
import { UserService } from '../user/services/user.service';
import { TokenIssuerService } from './services/token-issuer.service';
import { BCryptHashProvider } from '../providers/hash/hashing.provider';
import { EmailProvider } from '../providers/email.provider';
import { PreMatureAuthStrategy } from './strategies/premature-auth.strategy';
import { CookieProvider } from '../providers/cookie.provider';
import { RestrictPrematureRequestedResourceGuard } from './guards/restrict-premature-requested-resource.guard';
import { RestrictPrematureGrantTypeGuard } from './guards/restrict-premature-grant-type.guard';
import { RestrictPrematureSessionGuard } from './guards/restrict-premature-session.guard';
import { OtpProvider } from '../providers/two-factors/otp.provider';
import { KeycloakAuthorizationPermissionScopeGuard } from './guards/keycloak-authorization-permission-scope.guard';
import { KeycloakAccountScopeGuard } from './guards/keycloak-account-scope.guard';
import { KeycloakClientAuthStrategy } from './strategies/keycloak-client-auth.strategy';
import { TwoFactorsController } from './controllers/2fa-auth.controlller';
import { NetworkProvider } from '../providers/network.provider';
import { RegistryProvider } from '../providers/registry.provider';
import { PasswordService } from './services/password.service';
import { PermissionService } from './services/permission.service';
import { AccountVerificationService } from './services/account-verification.service';
import { TwoFactorsService } from './services/two-factor.service';
import { OtpService } from './services/otp.service';
import { AuthChallengeService } from './services/auth-challenge.service';
import { AuthSessionService } from './services/auth-session.service';
import { RestrictPrematureScopeGuard } from './guards/restrict-premature-scope.guard';
import { PasswordController } from './controllers/password.controller';
import { AccountVerificationController } from './controllers/account-verification.controller';
import { IdpAuthController } from './controllers/idp-auth.controller';
import { AuthSessionController } from './controllers/auth-session.controller';
import { IdpResourceBuilder } from '../user/factories/idp-resource.builder';
import { IdpResourceService } from '../user/services/idp-resource.service';
import { IdpAuthBuilder } from './factories/idp-auth.builder';
import { IdpAuthService } from './services/idp-auth.service';

@Module({
  controllers: [
    AuthController,
    AuthSessionController,
    IdpAuthController,
    AccountVerificationController,
    PasswordController,
    TwoFactorsController,
    ClientAuthController,
  ],
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
    AccountPolicyModule,
  ],
  providers: [
    /**
     * @dev Import services
     */
    AuthenticationService,
    TokenIssuerService,
    UserService,
    PasswordService,
    PermissionService,
    AccountVerificationService,
    TwoFactorsService,
    OtpService,
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
    KeycloakUserProvider,
    KeycloakAdminProvider,
    OpenIDProvider,
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
    KeycloakAuthStrategy,
    KeycloakClientAuthStrategy,
    PreMatureAuthStrategy,

    /**
     * @dev Import guards.
     */
    KeycloakAccountResourceAccessRolesGuard,
    KeycloakAuthorizationPermissionScopeGuard,
    KeycloakAccountScopeGuard,
    RestrictPrematureRequestedResourceGuard,
    RestrictPrematureGrantTypeGuard,
    RestrictPrematureSessionGuard,
    RestrictPrematureScopeGuard,
  ],
})
export class AuthModule {}
