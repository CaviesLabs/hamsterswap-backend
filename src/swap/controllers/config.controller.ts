import { Controller, Get } from '@nestjs/common';
import { SwapPlatformConfigEntity } from '../entities/swap-platform-config.entity';

@Controller('platform-config')
export class SwapConfigController {
  @Get()
  getConfig(): SwapPlatformConfigEntity {
    return {
      maxAllowedOptions: 4,
      maxAllowedItems: 4,
      allowCurrencies: [
        {
          id: 'So11111111111111111111111111111111111111112',
          image:
            'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
        },
      ],
      allowNTFCollections: [
        {
          id: '00862ed38eecc476bdfdebe71270cb767b998ba46e1ea59db437bcb899d55c0b',
          image:
            'https://arweave.net/43VYKdB0Cl03MfYyQnAymMwZUonJfCU1B7wZzgS0gl8?ext=jpeg',
        },
      ],
    };
  }
}
