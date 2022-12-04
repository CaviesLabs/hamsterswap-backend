import { OCSwapProposal } from '../../providers/swap-program/swap.type';
import {
  SwapProposalEntity,
  SwapProposalStatus,
} from '../entities/swap-proposal.entity';

export class OCSwapProposalDto extends SwapProposalEntity {
  public static statusMap: Record<string, SwapProposalStatus> = {
    created: SwapProposalStatus.CREATED,
    deposited: SwapProposalStatus.DEPOSITED,
    fulfilled: SwapProposalStatus.FULFILLED,
    canceled: SwapProposalStatus.CANCELED,
  };

  public static convertStatus(status: object): SwapProposalStatus {
    return OCSwapProposalDto.statusMap[Object.keys(status)[0].toLowerCase()];
  }

  constructor(proposal: OCSwapProposal, existed: SwapProposalEntity) {
    super();
    Object.assign(this, existed);
    this.fulfillBy = proposal.fulfilledBy.toBase58();
    this.fulfilledWithOptionId = proposal.fulfilledWithOptionId;
    this.status = OCSwapProposalDto.convertStatus(proposal.status);
    this.expiredAt = new Date(proposal.expiredAt.toNumber());
  }
}
