import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SwapProposalModel } from '../orm/model/swap-proposal.model';
import { RegistryProvider } from '../providers/registry.provider';
import { SwapProposalFactory } from './factory/swap-proposal.factory';

@Injectable()
export class SwapProposalSeeder implements OnApplicationBootstrap {
  constructor(
    private readonly registry: RegistryProvider,
    /**
     * @dev Mock factories
     */
    private readonly swapProposalFactory: SwapProposalFactory,
    /**
     * @dev repositories
     */
    @InjectRepository(SwapProposalModel)
    private readonly swapProposalModelRepo: Repository<SwapProposalModel>,
  ) {}

  async onApplicationBootstrap() {
    /**
     * @dev No running for production neither seeded
     */
    if (this.registry.getConfig().NODE_ENV === 'production') return;
    if (await this.isDBSeeded()) return;
    await this.seedingData();
  }

  private async isDBSeeded(): Promise<boolean> {
    /**
     * @dev use take = 1 for better performance
     */
    const proposalCount = await this.swapProposalModelRepo.findOne({
      where: {},
    });
    return !!proposalCount;
  }

  private async seedingData() {
    const proposals = this.swapProposalFactory.generateMany({}, 10);
    return this.swapProposalModelRepo.save(proposals);
  }
}
