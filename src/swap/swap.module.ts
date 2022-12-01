import { Module } from '@nestjs/common';
import { OrmModule } from '../orm/orm.module';
import { SwapConfigController } from './controllers/config.controller';
import { NftController } from './controllers/nft.controller';
import { ProposalController } from './controllers/proposal.controller';
import { ProposalService } from './services/proposal.service';
import { ProposalSubscriber } from './subscribers/proposal.subscriber';

@Module({
  imports: [OrmModule],
  controllers: [ProposalController, SwapConfigController, NftController],
  providers: [ProposalService, ProposalSubscriber],
})
export class SwapModule {}
