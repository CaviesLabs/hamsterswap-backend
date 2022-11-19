import { Module } from '@nestjs/common';
import { OrmModule } from '../orm/orm.module';
import { KeycloakAdminProvider } from '../providers/federated-users/keycloak-admin.provider';
import { OpenIDProvider } from '../providers/federated-users/openid.provider';
import { RegistryProvider } from '../providers/registry.provider';

import { AccountPolicyController } from './account-policy.controller';
import { BanPolicyService } from './services/ban-policy.service';
import { OtpPolicyService } from './services/opt-policy.service';
import { PolicyLockService } from './services/policy-lock.service';

@Module({
  imports: [OrmModule],
  providers: [
    /**
     * @dev Import providers.
     */
    RegistryProvider,
    OpenIDProvider,
    KeycloakAdminProvider,
    /**
     * @dev Provide services.
     */
    PolicyLockService,
    OtpPolicyService,
    BanPolicyService,
  ],
  controllers: [AccountPolicyController],
  exports: [PolicyLockService, OtpPolicyService, BanPolicyService],
})
export class AccountPolicyModule {}
