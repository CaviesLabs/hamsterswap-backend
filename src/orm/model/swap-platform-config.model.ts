import { Column, Entity } from 'typeorm';

import { SwapPlatformConfigEntity } from '../../swap/entities/swap-platform-config.entity';
import { BaseModel } from '../base.model';

@Entity({
  name: 'swap_platform_config',
})
export class SwapPlatformConfigModel
  extends BaseModel
  implements SwapPlatformConfigEntity
{
  @Column({ type: Number })
  maxAllowedOptions: number;

  @Column({ type: Number })
  maxAllowedItems: number;

  @Column({ type: String, array: true })
  allowNTFCollections: string[];

  @Column({ type: String, array: true })
  allowCurrencies: string[] = ['SOL'];
}
