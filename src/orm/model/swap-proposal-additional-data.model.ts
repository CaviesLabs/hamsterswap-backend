import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { SwapProposalAdditionalDataEntity } from '../../swap/entities/swap-proposal.entity';
import { BaseModel } from '../base.model';
import { SwapProposalModel } from './swap-proposal.model';

@Entity({
  name: 'swap_proposal_additional_data',
})
export class SwapProposalAdditionalDataModel
  extends BaseModel
  implements SwapProposalAdditionalDataEntity
{
  @OneToOne(() => SwapProposalModel)
  @JoinColumn()
  proposal: SwapProposalModel;

  @Column({ type: String })
  note: string;
}
