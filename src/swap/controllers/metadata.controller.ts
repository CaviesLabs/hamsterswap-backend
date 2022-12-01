import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TokenMetadataProvider } from '../../providers/token-metadata.provider';

@Controller('metadata')
@ApiTags('metadata')
export class MetadataController {
  constructor(private readonly tokenMetadataProvider: TokenMetadataProvider) {}

  @Get('/nft/list')
  listNft(@Query('address') address: string) {
    return this.tokenMetadataProvider.listNft(address);
  }

  @Get('/nft/detail/:id')
  getNftDetail(@Param('id') id: string) {
    return this.tokenMetadataProvider.getNftDetail(id);
  }

  @Get('/currency/:token')
  getToken(@Param('token') token: string) {
    return this.tokenMetadataProvider.getConcurrencyDetail(token);
  }

  @Get('/currency')
  listToken(@Query('address') address: string) {
    return this.tokenMetadataProvider.listConcurrency(address);
  }
}
