import { Entity, JoinTable, ManyToMany } from 'typeorm';

import { SwapOptionEntity } from '../../swap/entities/swap-option.entity';
import { BaseModel } from '../base.model';
import { SwapItemModel } from './swap-item.model';

@Entity({
  name: 'swap_option',
})
export class SwapOptionModel extends BaseModel implements SwapOptionEntity {
  @ManyToMany(() => SwapItemModel, { cascade: true })
  @JoinTable()
  items: SwapItemModel[];
}
