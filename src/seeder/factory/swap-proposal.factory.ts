import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { faker } from '@faker-js/faker';
import { randomInt } from 'crypto';

import { SwapProposalModel } from '../../orm/model/swap-proposal.model';
import { SwapProposalStatus } from '../../swap/entities/swap-proposal.entity';
import { SwapItemFactory } from './swap-item.factory';
import { SwapOptionFactory } from './swap-option.factory';
import { SwapItemStatus } from '../../swap/entities/swap-item.entity';
import { randomFulfillAddress, randomOwnerAddress } from './address.factory';

@Injectable()
export class SwapProposalFactory {
  constructor(
    private readonly swapItemFactory: SwapItemFactory,
    private readonly swapOptionFactory: SwapOptionFactory,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  generate({
    ownerAddress,
    ownerId,
  }: Pick<SwapProposalModel, 'ownerId' | 'ownerAddress'>): SwapProposalModel {
    const proposal = this.entityManager
      .getRepository(SwapProposalModel)
      .create({
        ownerId,
        ownerAddress: ownerAddress ?? randomOwnerAddress(),
        status: faker.helpers.arrayElement<SwapProposalStatus>([
          SwapProposalStatus.CREATED,
          SwapProposalStatus.DEPOSITED,
        ]),
        expireAt: faker.date.soon(30),
        note: faker.lorem.paragraphs(),
      });

    proposal.fulfillBy = faker.helpers.maybe(
      () => randomFulfillAddress(proposal.ownerAddress),
      { probability: 0.75 },
    );

    const itemStatus = proposal.fulfillBy
      ? SwapItemStatus.REDEEMED
      : faker.helpers.arrayElement([
          SwapItemStatus.CREATED,
          SwapItemStatus.DEPOSITED,
        ]);
    const contractAddress = faker.finance.ethereumAddress();

    proposal.offerItems = this.swapItemFactory.generateMany(
      {
        ownerAddress: proposal.ownerAddress,
        contractAddress,
        status: itemStatus,
      },
      randomInt(1, 4),
    );

    proposal.swapOptions = this.swapOptionFactory.generateMany(
      {
        ownerAddress: proposal.ownerAddress,
        contractAddress,
        status: itemStatus,
      },
      randomInt(1, 4),
    );

    return proposal;
  }

  generateMany(
    template: Pick<SwapProposalModel, 'ownerId' | 'ownerAddress'>,
    count: number,
  ): SwapProposalModel[] {
    return Array.from({ length: count }, () => this.generate(template));
  }
}
