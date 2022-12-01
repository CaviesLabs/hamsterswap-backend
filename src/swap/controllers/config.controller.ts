import { Controller, Get } from '@nestjs/common';
import { SwapPlatformConfigEntity } from '../entities/swap-platform-config.entity';

@Controller('platform-config')
export class SwapConfigController {
  @Get()
  getConfig(): SwapPlatformConfigEntity {
    return {
      maxAllowedOptions: 4,
      maxAllowedItems: 4,
      allowCurrencies: ['So11111111111111111111111111111111111111112'],
      allowNTFCollections: [
        '00862ed38eecc476bdfdebe71270cb767b998ba46e1ea59db437bcb899d55c0b',
      ],
    };
  }
}
