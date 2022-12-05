import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TokenMetadataProvider } from '../../providers/token-metadata.provider';

@Controller('metadata')
@ApiTags('metadata')
export class MetadataController {
  constructor(private readonly tokenMetadataProvider: TokenMetadataProvider) {}

  @Get('/nft/portfolio')
  listNft(@Query('walletAddress') walletAddress: string) {
    return this.tokenMetadataProvider.listNft(walletAddress);
  }

  @Get('/nft/detail/:mintAddress')
  getNftDetail(@Param('mintAddress') mintAddress: string) {
    return this.tokenMetadataProvider.getNftDetail(mintAddress);
  }

  @Get('/token/:mintAddress')
  getToken(@Param('mintAddress') mintAddress: string) {
    return this.tokenMetadataProvider.getConcurrencyDetail(mintAddress);
  }

  @Get('/token/portfolio')
  listToken(@Query('walletAddress') walletAddress: string) {
    return this.tokenMetadataProvider.listConcurrency(walletAddress);
  }

  @Get('/collection/:collectionId')
  getCollectionById(@Param('collectionId') collectionId: string) {
    return this.tokenMetadataProvider.getCollection(collectionId);
  }
}
