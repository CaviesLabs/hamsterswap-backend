import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SwapProposalModel } from '../../orm/model/swap-proposal.model';
import { SwapProposalEntity } from '../entities/swap-proposal.entity';

@Injectable()
export class ProposalService {
  constructor(
    @InjectRepository(SwapProposalModel)
    private readonly swapProposalModelRepo: Repository<SwapProposalModel>,
  ) {}
  public async get(proposalId: string): Promise<SwapProposalEntity> {
    return this.swapProposalModelRepo.findOneOrFail({
      where: { id: proposalId },
      relations: {
        offerItems: true,
        swapOptions: {
          items: true,
        },
      },
    });
  }
}
