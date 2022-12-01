import { Entity, ManyToOne, OneToMany } from 'typeorm';

import { SwapOptionEntity } from '../../swap/entities/swap-option.entity';
import { BaseModel } from '../base.model';
import { SwapItemModel } from './swap-item.model';
import { SwapProposalModel } from './swap-proposal.model';

@Entity({
  name: 'swap_option',
})
export class SwapOptionModel extends BaseModel implements SwapOptionEntity {
  @ManyToOne(() => SwapProposalModel)
  proposal: SwapProposalModel;

  @OneToMany(() => SwapItemModel, (item) => item.swapOption, {
    cascade: true,
    nullable: true,
  })
  items: SwapItemModel[];
}
