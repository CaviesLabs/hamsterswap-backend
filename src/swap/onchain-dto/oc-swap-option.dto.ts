import { OCSwapOption } from '../../providers/swap-program/swap.type';
import { SwapOptionEntity } from '../entities/swap-option.entity';
import { toUUIDv4 } from './primitive.helper';

export class OCSwapOptionDto extends SwapOptionEntity {
  constructor(ocOption: OCSwapOption, existed?: SwapOptionEntity) {
    super();
    if (existed) {
      this.id = existed.id;
    } else {
      this.id = toUUIDv4(ocOption.id);
    }
  }
}
