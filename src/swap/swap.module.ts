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
import { ProposalController } from './controllers/solana/proposal.controller';
import { TokenMetadataService } from './services/token-metadata.service';
import { ProposalService } from './services/proposal.service';
import { SyncSwapProposalService } from './services/sync-proposal.service';
import { ProposalSubscriber } from './subscribers/proposal.subscriber';

@Module({
  imports: [OrmModule],
  controllers: [ProposalController, SwapConfigController, MetadataController],
  providers: [
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
