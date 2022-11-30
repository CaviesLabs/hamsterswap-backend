import { SwapItemEntity } from './swap-item.entity';
import { SwapOptionEntity } from './swap-option.entity';

export enum SwapProposalStatus {
  CREATED = 'SWAP_PROPOSAL_STATUS::CREATED',
  DEPOSITED = 'SWAP_PROPOSAL_STATUS::DEPOSITED',
  FULFILLED = 'SWAP_PROPOSAL_STATUS::FULFILLED',
  CANCELED = 'SWAP_PROPOSAL_STATUS::CANCELED',
}

export class SwapProposalEntity {
  id: string;

  ownerId: string;

  ownerAddress: string;

  offerItems: SwapItemEntity[] = [];

  swapOptions: SwapOptionEntity[] = [];

  fulfillBy?: string;

  fulfilledWithOptionId?: string;

  expireAt: Date;

  status: SwapProposalStatus;

  searchText?: string;

  note?: string;
}
