import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SwapPlatformConfigEntity } from '../entities/swap-platform-config.entity';

@Controller('platform-config')
@ApiTags('swap')
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
          name: 'Solana',
          type: 'token',
        },
      ],
      allowNTFCollections: [
        {
          id: '3cf5721fbaf1a81f69c6eeb833840e44e99955854d22f53ccd903581552e8e73',
          image:
            'https://www.arweave.net/56qWrf1lml3Bb5XgS_Ltlqtoaf3s0Qmu7t5OGMwN7DI?ext=png',
          type: 'nft-collection',
          name: 'Ancient 8 - The Generals',
        },
        {
          id: 'a38e8d9d1a16b625978803a7d4eb512bc20ff880c8fd6cc667944a3d7b5e4acf',
          image: 'https://metadata.degods.com/g/9999-dead.png',
          type: 'nft-collection',
          name: 'DeGods',
        },
      ],
    };
  }
}
