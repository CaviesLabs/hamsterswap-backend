import { Module } from '@nestjs/common';
import { AuthChallengeService } from '../auth/services/auth-challenge.service';
import { OrmModule } from '../orm/orm.module';
import { NetworkProvider } from '../providers/network.provider';
import { TokenMetadataProvider } from '../providers/token-metadata.provider';
import { IdpResourceBuilder } from '../user/factories/idp-resource.builder';
import { IdpResourceService } from '../user/services/idp-resource.service';
import { SwapConfigController } from './controllers/config.controller';
import { MetadataController } from './controllers/metadata.controller';
import { ProposalController } from './controllers/proposal.controller';
import { ProposalService } from './services/proposal.service';
import { ProposalSubscriber } from './subscribers/proposal.subscriber';

@Module({
  imports: [OrmModule],
  controllers: [ProposalController, SwapConfigController, MetadataController],
  providers: [
    ProposalService,
    ProposalSubscriber,
    NetworkProvider,
    TokenMetadataProvider,
    AuthChallengeService,
    IdpResourceBuilder,
    IdpResourceService,
  ],
})
export class SwapModule {}
