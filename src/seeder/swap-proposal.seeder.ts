import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SwapProposalModel } from '../orm/model/swap-proposal.model';
import { UserModel } from '../orm/model/user.model';
import { RegistryProvider } from '../providers/registry.provider';
import { SwapProposalFactory } from './factory/swap-proposal.factory';
import { UserFactory } from './factory/user.factory';

@Injectable()
export class SwapProposalSeeder implements OnApplicationBootstrap {
  constructor(
    private readonly registry: RegistryProvider,
    /**
     * @dev Mock factories
     */
    private readonly userFactory: UserFactory,
    private readonly swapProposalFactory: SwapProposalFactory,
    /**
     * @dev repositories
     */
    @InjectRepository(UserModel)
    private readonly UserRepo: Repository<UserModel>,
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
    const user = await this.UserRepo.save(this.userFactory.generate());
    const proposals = this.swapProposalFactory.generateMany(
      {
        ownerId: user.id,
        ownerAddress: undefined,
      },
      10,
    );
    await this.swapProposalModelRepo.save(proposals);
  }
}
