import { Module } from '@nestjs/common';
import { OrmModule } from '../orm/orm.module';
import { ProposalController } from './controllers/proposal.controller';
import { ProposalService } from './services/proposal.service';
import { ProposalSubscriber } from './subscribers/proposal.subscriber';

@Module({
  imports: [OrmModule],
  controllers: [ProposalController],
  providers: [ProposalService, ProposalSubscriber],
})
export class SwapModule {}