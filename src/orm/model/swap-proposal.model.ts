import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';

import {
  SwapProposalEntity,
  SwapProposalStatus,
} from '../../swap/entities/swap-proposal.entity';
import { BaseModel } from '../base.model';
import { SwapItemModel } from './swap-item.model';
import { SwapOptionModel } from './swap-option.model';
import { UserModel } from './user.model';

@Entity({
  name: 'swap_proposal',
})
export class SwapProposalModel extends BaseModel implements SwapProposalEntity {
  @Column({ type: String })
  ownerId: string;

  @ManyToOne(() => UserModel)
  owner: UserModel;

  @Column({ type: String })
  ownerAddress: string;

  @ManyToMany(() => SwapItemModel, { cascade: true })
  @JoinTable()
  offerItems: SwapItemModel[];

  @ManyToMany(() => SwapOptionModel, { cascade: true })
  @JoinTable()
  swapOptions: SwapOptionModel[];

  @Column({ type: String, nullable: true })
  fulfillBy?: string;

  @Column({ type: String, nullable: true })
  fulfilledWithOptionId: string;

  @ManyToOne(() => SwapOptionModel)
  fulfilledWithOption: SwapOptionModel;

  @Column({ type: 'timestamptz' })
  expireAt: Date;

  @Column({ type: String, enum: SwapProposalStatus })
  status: SwapProposalStatus;

  @Column({ type: String, default: '' })
  note: string;

  @Column({ type: String, default: '' })
  @Index({ fulltext: true })
  searchText: string;
}
