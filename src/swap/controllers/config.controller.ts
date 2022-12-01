import { Controller, Get } from '@nestjs/common';
import { SwapPlatformConfigEntity } from '../entities/swap-platform-config.entity';

@Controller('platform-config')
export class SwapConfigController {
  @Get()
  getConfig(): SwapPlatformConfigEntity {
    return {
      maxAllowedOptions: 4,
      maxAllowedItems: 4,
      allowCurrencies: [],
      allowNTFCollections: [],
    };
  }
}
