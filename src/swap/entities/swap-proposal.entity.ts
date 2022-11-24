import { SwapItemEntity } from './swap-item.entity';
import { SwapOptionEntity } from './swap-option.entity';

export enum SwapProposalStatus {
  CREATED = 'SWAP_PROPOSAL_STATUS::CREATED',
  SETTLED = 'SWAP_PROPOSAL_STATUS::SETTLED',
}

export class SwapProposalEntity {
  ownerAddress: string;

  offerItems: SwapItemEntity[];

  swapOptions: SwapOptionEntity[];

  fulfillBy?: string;

  expireAt: Date;

  status: SwapProposalStatus;
}
