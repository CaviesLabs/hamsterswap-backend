import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

import {
  SwapProposalEntity,
  SwapProposalStatus,
} from '../../swap/entities/swap-proposal.entity';
import { BaseModel } from '../base.model';
import { SwapItemModel } from './swap-item.model';
import { SwapOptionModel } from './swap-option.model';

@Entity({
  name: 'swap_proposal',
})
export class SwapProposalModel extends BaseModel implements SwapProposalEntity {
  @Column({ type: String })
  ownerAddress: string;

  @ManyToMany(() => SwapItemModel, { cascade: true })
  @JoinTable()
  offerItems: SwapItemModel[];

  @ManyToMany(() => SwapOptionModel, { cascade: true })
  @JoinTable()
  swapOptions: SwapOptionModel[];

  @Column({ type: String })
  fulfillBy?: string;

  @Column({ type: Date })
  expireAt: Date;

  @Column({ type: String, enum: SwapProposalStatus })
  status: SwapProposalStatus;
}
