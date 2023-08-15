import { Module } from '@nestjs/common';
import { AuthChallengeService } from '../auth/services/auth-challenge.service';
import { OrmModule } from '../orm/orm.module';
import { NetworkProvider } from '../providers/network.provider';
import { SwapProgramProvider } from '../providers/swap-program/swap-program.provider';
import { TokenMetadataProvider } from '../providers/token-metadata.provider';
import { IdpResourceBuilder } from '../user/factories/idp-resource.builder';
import { IdpResourceService } from '../user/services/idp-resource.service';
import { SwapConfigController } from './controllers/solana/config.controller';
import { MetadataController } from './controllers/solana/metadata.controller';
import { ProposalController } from './controllers/proposal.controller';
import { TokenMetadataService } from './services/solana/token-metadata.service';
import { ProposalService } from './services/proposal.service';
import { SyncSwapProposalService } from './services/solana/sync-proposal.service';
import { ProposalSubscriber } from './subscribers/proposal.subscriber';
import { EvmSwapConfigController } from './controllers/evm/config.controller';
import { EvmMetadataController } from './controllers/evm/metadata.controller';
import { EvmBalanceService } from './services/evm/evm-balance.service';
import { EvmMetadataService } from './services/evm/evm-metadata.service';
import { RegistryProvider } from '../providers/registry.provider';

@Module({
  imports: [OrmModule],
  controllers: [
    EvmSwapConfigController,
    EvmMetadataController,
    ProposalController,
    SwapConfigController,
    MetadataController,
  ],
  providers: [
    EvmMetadataService,
    EvmBalanceService,
    RegistryProvider,
    ProposalService,
    NetworkProvider,
    SwapProgramProvider,
    TokenMetadataProvider,
    AuthChallengeService,
    IdpResourceBuilder,
    IdpResourceService,
    ProposalSubscriber,
    SyncSwapProposalService,
    TokenMetadataService,
  ],
})
export class SwapModule {}
