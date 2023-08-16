import { SwapItemEntity } from './swap-item.entity';
import { ChainId } from './swap-platform-config.entity';

export class SwapOptionEntity {
  id: string;
  chainId: ChainId;
  items: SwapItemEntity[];
}
