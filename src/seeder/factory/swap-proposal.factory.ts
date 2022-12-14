import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { faker } from '@faker-js/faker';
import { randomInt, randomUUID } from 'crypto';

import { SwapProposalModel } from '../../orm/model/swap-proposal.model';
import { SwapProposalStatus } from '../../swap/entities/swap-proposal.entity';
import { SwapItemFactory } from './swap-item.factory';
import { SwapOptionFactory } from './swap-option.factory';
import { SwapItemStatus } from '../../swap/entities/swap-item.entity';
import {
  randomContractAddress,
  randomFulfillAddress,
  randomOwnerAddress,
} from './address.factory';

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
        id: randomUUID(),
        ownerId,
        ownerAddress: ownerAddress ?? randomOwnerAddress(),
        status: faker.helpers.arrayElement<SwapProposalStatus>([
          SwapProposalStatus.CREATED,
          SwapProposalStatus.DEPOSITED,
        ]),
        expiredAt: faker.date.soon(30),
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
    const contractAddress = randomContractAddress();

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

    if (proposal.fulfillBy) {
      proposal.fulfilledWithOptionId = faker.helpers.arrayElement(
        proposal.swapOptions,
      ).id;
    }

    return proposal;
  }

  generateMany(
    template: Pick<SwapProposalModel, 'ownerId' | 'ownerAddress'>,
    count: number,
  ): SwapProposalModel[] {
    return Array.from({ length: count }, () => this.generate(template));
  }
}
