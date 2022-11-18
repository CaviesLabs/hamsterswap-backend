import { Module } from '@nestjs/common';

import { OrmModule } from '../orm/orm.module';
import { RegistryProvider } from '../providers/registry.provider';
import {
  AuditLoggerContextMap,
  AuditLoggerService,
} from './audit-logger.service';
import { AuditGuard } from './audit.guard';
import { OpenIDProvider } from '../providers/federated-users/openid.provider';

@Module({
  /**
   * @dev Import modules
   */
  imports: [OrmModule],
  /**
   * @dev Import providers
   */
  providers: [
    RegistryProvider,
    AuditLoggerService,
    AuditLoggerContextMap,
    AuditGuard,
    OpenIDProvider,
  ],
  exports: [AuditLoggerContextMap, AuditLoggerService, AuditGuard],
})
export class AuditModule {}
