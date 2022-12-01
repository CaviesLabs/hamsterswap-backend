import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { randomInt, randomUUID } from 'crypto';

import { SwapItemFactory } from './swap-item.factory';
import { SwapItemEntity } from '../../swap/entities/swap-item.entity';
import { SwapOptionModel } from '../../orm/model/swap-option.model';

@Injectable()
export class SwapOptionFactory {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly swapItemFactory: SwapItemFactory,
  ) {}

  generate(
    template: Partial<SwapItemEntity> & Pick<SwapItemEntity, 'status'>,
  ): SwapOptionModel {
    return this.entityManager.getRepository(SwapOptionModel).create({
      id: randomUUID(),
      items: this.swapItemFactory.generateMany(template, randomInt(1, 4)),
    });
  }

  generateMany(
    template: Partial<SwapItemEntity> & Pick<SwapItemEntity, 'status'>,
    count: number,
  ) {
    return Array.from({ length: count }, () => this.generate(template));
  }
}
