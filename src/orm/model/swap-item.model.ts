import { Column, Entity } from 'typeorm';

import {
  SwapItemEntity,
  SwapItemStatus,
  SwapItemType,
} from '../../swap/entities/swap-item.entity';
import { BaseModel } from '../base.model';

@Entity({
  name: 'swap_item',
})
export class SwapItemModel extends BaseModel implements SwapItemEntity {
  @Column({ type: String, nullable: true })
  ownerAddress?: string;

  @Column({ type: String, enum: SwapItemType })
  type: SwapItemType;

  @Column({ type: String })
  contractAddress: string;

  @Column({ type: String, nullable: true })
  depositedAddress?: string;

  @Column({ type: String })
  amount: number;

  @Column({ type: String, enum: SwapItemStatus })
  status: SwapItemStatus;

  @Column({ type: 'jsonb', nullable: true })
  nftMetadata?: any;
}