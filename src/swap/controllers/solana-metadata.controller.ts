import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SolanaTokenMetadataProvider } from '../../providers/metadata-provider/solana-token-metadata.provider';
import { SolanaTokenMetadataService } from '../services/solana-token-metadata.service';

@Controller('metadata/solana')
@ApiTags('metadata/solana')
export class SolanaMetadataController {
  constructor(
    private readonly tokenMetadataProvider: SolanaTokenMetadataProvider,
    private readonly tokenMetadataService: SolanaTokenMetadataService,
  ) {}

  @Get('/nft/portfolio')
  listNft(@Query('walletAddress') walletAddress: string) {
    return this.tokenMetadataProvider.listNft(walletAddress);
  }

  @Get('/nft/v1/portfolio')
  listNftV1(@Query('walletAddress') walletAddress: string) {
    return this.tokenMetadataService.getNftsByWallet(walletAddress);
  }

  @Get('/nft/detail/:mintAddress')
  async getNftDetail(@Param('mintAddress') mintAddress: string) {
    const [metadata] = await this.tokenMetadataService.getNftMetadata([
      mintAddress,
    ]);
    return {
      data: [metadata.metadata],
    };
  }

  @Get('/token/:mintAddress')
  getToken(@Param('mintAddress') mintAddress: string) {
    return this.tokenMetadataProvider.getCurrencyDetail(mintAddress);
  }

  @Get('/token/portfolio')
  listToken(@Query('walletAddress') walletAddress: string) {
    return this.tokenMetadataProvider.listCurrency(walletAddress);
  }

  @Get('/collection/:collectionId')
  getCollectionById(@Param('collectionId') collectionId: string) {
    return this.tokenMetadataProvider.getCollection(collectionId);
  }
}
