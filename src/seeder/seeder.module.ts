import { Module } from '@nestjs/common';
import { OrmModule } from '../orm/orm.module';
import { RegistryProvider } from '../providers/registry.provider';
import { SwapItemFactory } from './factory/swap-item.factory';
import { SwapOptionFactory } from './factory/swap-option.factory';
import { SwapProposalFactory } from './factory/swap-proposal.factory';
import { UserFactory } from './factory/user.factory';

import { SwapProposalSeeder } from './swap-proposal.seeder';

@Module({
  imports: [OrmModule],
  providers: [
    RegistryProvider,
    UserFactory,
    SwapItemFactory,
    SwapOptionFactory,
    SwapProposalFactory,
    SwapProposalSeeder,
  ],
})
export class SeederModule {}
