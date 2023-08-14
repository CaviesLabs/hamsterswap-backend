import { ChainId } from './swap-platform-config.entity';

export enum SwapItemType {
  NFT = 'SWAP_ITEM_TYPE::NFT',
  CURRENCY = 'SWAP_ITEM_TYPE::CURRENCY',
  CASH = 'SWAP_ITEM_TYPE::CASH',
  GAME = 'SWAP_ITEM_TYPE::GAME',
}

export enum SwapItemStatus {
  CREATED = 'SWAP_ITEM_STATUS::CREATED',
  DEPOSITED = 'SWAP_ITEM_STATUS::DEPOSITED',
  REDEEMED = 'SWAP_ITEM_STATUS::REDEEMED',
  WITHDRAWN = 'SWAP_ITEM_STATUS::WITHDRAWN',
}

export class SwapItemEntity {
  id: string;

  chainId: ChainId;

  ownerAddress?: string;

  type: SwapItemType;

  contractAddress: string;

  depositedAddress?: string;

  amount: number;

  status: SwapItemStatus;

  nftMetadata?: any;
}
