import { SwapItemEntity } from './swap-item.entity';
import { SwapOptionEntity } from './swap-option.entity';

export enum SwapProposalStatus {
  CREATED = 'SWAP_PROPOSAL_STATUS::CREATED',
  DEPOSITED = 'SWAP_PROPOSAL_STATUS::DEPOSITED',
  FULFILLED = 'SWAP_PROPOSAL_STATUS::FULFILLED',
  CANCELED = 'SWAP_PROPOSAL_STATUS::CANCELED',
  REDEEMED = 'SWAP_PROPOSAL_STATUS::REDEEMED',
  WITHDRAWN = 'SWAP_PROPOSAL_STATUS::WITHDRAWN',
  EXPIRED = 'SWAP_PROPOSAL_STATUS::EXPIRED',
}

export enum ComputedSwapProposalStatus {
  ACTIVE = 'SWAP_PROPOSAL_STATUS::ACTIVE',
  EXPIRED = 'SWAP_PROPOSAL_STATUS::EXPIRED',
  SWAPPED = 'SWAP_PROPOSAL_STATUS::SWAPPED',
  REDEEMED = 'SWAP_PROPOSAL_STATUS::REDEEMED',
  WITHDRAWN = 'SWAP_PROPOSAL_STATUS::WITHDRAWN',
}

export class SwapProposalEntity {
  id: string;

  numberId: number;

  ownerId: string;

  ownerAddress: string;

  offerItems: SwapItemEntity[] = [];

  swapOptions: SwapOptionEntity[] = [];

  fulfillBy?: string;

  fulfilledWithOptionId?: string;

  expiredAt: Date;

  status: SwapProposalStatus;

  searchText?: string;

  note?: string;
}
