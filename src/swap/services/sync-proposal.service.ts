import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { SwapItemModel } from '../../orm/model/swap-item.model';
import { SwapProposalModel } from '../../orm/model/swap-proposal.model';
import { SwapProgramProvider } from '../../providers/swap-program/swap-program.provider';
import { SwapProposalEntity } from '../entities/swap-proposal.entity';

@Injectable()
export class SyncSwapProposalService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectRepository(SwapProposalModel)
    private readonly swapProposalModelRepo: Repository<SwapProposalModel>,
    private readonly swapProgramProvider: SwapProgramProvider,
  ) {}

  public async syncById(id: string): Promise<SwapProposalEntity> {
    const onchainProposal = await this.swapProgramProvider.getSwapProposal(id);
    const offerItems = (onchainProposal.offeredItems as any[]).map(() =>
      this.entityManager.create(SwapItemModel, {}),
    );
    console.log(offerItems);
    // TODO: not done
    return undefined;
  }
}
