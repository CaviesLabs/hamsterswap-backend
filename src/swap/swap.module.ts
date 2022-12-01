import { Module } from '@nestjs/common';
import { OrmModule } from '../orm/orm.module';
import { NetworkProvider } from '../providers/network.provider';
import { TokenMetadataProvider } from '../providers/token-metadata.provider';
import { SwapConfigController } from './controllers/config.controller';
import { NftController } from './controllers/nft.controller';
import { ProposalController } from './controllers/proposal.controller';
import { ProposalService } from './services/proposal.service';
import { ProposalSubscriber } from './subscribers/proposal.subscriber';

@Module({
  imports: [OrmModule],
  controllers: [ProposalController, SwapConfigController, NftController],
  providers: [
    ProposalService,
    ProposalSubscriber,
    NetworkProvider,
    TokenMetadataProvider,
  ],
})
export class SwapModule {}
