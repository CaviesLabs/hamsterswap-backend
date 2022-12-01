import { Controller, Get, Param } from '@nestjs/common';
import { TokenMetadataProvider } from '../../providers/token-metadata.provider';

@Controller('nft')
export class NftController {
  constructor(private readonly tokenMetadataProvider: TokenMetadataProvider) {}

  @Get('/:address/list')
  list(@Param('address') address: string) {
    return this.tokenMetadataProvider.listNft(address);
  }

  @Get('/detail/:id')
  getDetail(@Param('id') id: string) {
    return this.tokenMetadataProvider.getNftDetail(id);
  }
}
