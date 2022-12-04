import { OCSwapItem } from '../../providers/swap-program/swap.type';
import {
  SwapItemEntity,
  SwapItemStatus,
  SwapItemType,
} from '../entities/swap-item.entity';
import { toUUIDv4 } from './primitive.helper';

export class OCSwapItemDto extends SwapItemEntity {
  public static typeMap: Record<string, SwapItemType> = {
    nft: SwapItemType.NFT,
    currency: SwapItemType.CURRENCY,
  };

  public static convertType(type: object): SwapItemType {
    return OCSwapItemDto.typeMap[Object.keys(type)[0].toLowerCase()];
  }

  public static statusMap: Record<string, SwapItemStatus> = {
    created: SwapItemStatus.CREATED,
    deposited: SwapItemStatus.DEPOSITED,
    redeemed: SwapItemStatus.REDEEMED,
    withdrawn: SwapItemStatus.WITHDRAWN,
  };

  public static convertStatus(status: object): SwapItemStatus {
    return OCSwapItemDto.statusMap[Object.keys(status)[0].toLowerCase()];
  }

  constructor(ocItem: OCSwapItem, existed?: SwapItemEntity) {
    super();
    if (existed) {
      this.id = existed.id;
    } else {
      this.id = toUUIDv4(ocItem.id);
    }
    this.ownerAddress = ocItem.owner.toBase58();
    this.type = OCSwapItemDto.convertType(ocItem.itemType);
    this.contractAddress = ocItem.mintAccount.toBase58();
    this.amount = ocItem.amount.toNumber();
    this.status = OCSwapItemDto.convertStatus(ocItem.status);
  }
}
