import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { faker } from '@faker-js/faker';

import {
  SwapItemEntity,
  SwapItemType,
} from '../../swap/entities/swap-item.entity';
import { randomContractAddress, randomOwnerAddress } from './address.factory';
import { SwapItemModel } from '../../orm/model/swap-item.model';

@Injectable()
export class SwapItemFactory {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  generate({
    ownerAddress,
    contractAddress,
    depositedAddress,
    status,
  }: Partial<SwapItemEntity> & Pick<SwapItemEntity, 'status'>): SwapItemModel {
    const type = faker.helpers.arrayElement([
      SwapItemType.CURRENCY,
      SwapItemType.CURRENCY,
    ]);
    return this.entityManager.getRepository(SwapItemModel).create({
      ownerAddress: ownerAddress ?? randomOwnerAddress(),
      contractAddress: contractAddress ?? randomContractAddress(),
      depositedAddress,
      status,
      type,
      amount: +faker.finance.amount(0, 10, type == SwapItemType.NFT ? 1 : 5),
    });
  }

  generateMany(
    template: Partial<SwapItemEntity> & Pick<SwapItemEntity, 'status'>,
    count: number,
  ): SwapItemModel[] {
    return Array.from({ length: count }, () => this.generate(template));
  }
}
