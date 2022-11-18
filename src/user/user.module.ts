import { Module } from '@nestjs/common';

import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { KeycloakAdminProvider } from '../providers/federated-users/keycloak-admin.provider';
import { OpenIDProvider } from '../providers/federated-users/openid.provider';
import { StorageProvider } from '../providers/s3.provider';
import { KeycloakUserProvider } from '../providers/federated-users/keycloak-user.provider';
import { KeycloakAccountResourceAccessRolesGuard } from '../auth/guards/keycloak-account-resource-access-roles.guard';
import { KeycloakAuthStrategy } from '../auth/strategies/keycloak-auth.strategy';
import { ClientUserController } from './controllers/client-user.controller';
import { OrmModule } from '../orm/orm.module';
import { AuditModule } from '../audit/audit.module';
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

@Module({
  /**
   * @dev Import modules
   */
  imports: [OrmModule, AuditModule],
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
    KeycloakUserProvider,
    KeycloakAdminProvider,
    OpenIDProvider,
    NetworkProvider,
    JwtProvider,

    /**
     * @dev Import strategies
     */
    KeycloakAuthStrategy,

    /**
     * @dev Import guards.
     */
    KeycloakAccountResourceAccessRolesGuard,
  ],
})
export class UserModule {}
