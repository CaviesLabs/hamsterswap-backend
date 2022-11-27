export enum SwapItemType {
  NFT = 'SWAP_ITEM_TYPE::NFT',
  CURRENCY = 'SWAP_ITEM_TYPE::CURRENCY',
}

export enum SwapItemStatus {
  CREATED = 'SWAP_ITEM_STATUS::CREATED',
  DEPOSITED = 'SWAP_ITEM_STATUS::DEPOSITED',
  REDEEMED = 'SWAP_ITEM_STATUS::REDEEMED',
}

export class SwapItemEntity {
  ownerAddress?: string;

  type: SwapItemType;

  contractAddress: string;

  depositedAddress?: string;

  amount: number;

  status: SwapItemStatus;

  nftMetadata?: any;
}
