import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { EvmTokenMetadataProvider } from '../../providers/metadata-provider/evm-token-metadata.provider';
import { EvmTokenMetadataService } from '../services/evm-token-metadata.service';
import { SupportedChain } from '../../providers/registry.provider';

@Controller('metadata/evm')
@ApiTags('metadata/evm')
export class EvmMetadataController {
  constructor(
    private readonly tokenMetadataProvider: EvmTokenMetadataProvider,
    private readonly tokenMetadataService: EvmTokenMetadataService,
  ) {}

  @Get('/nft/portfolio')
  listNft(
    @Query('walletAddress') walletAddress: string,
    @Query('chain') chain: SupportedChain.bsc | SupportedChain.goerli,
  ) {
    return this.tokenMetadataProvider.listNFTAssets(chain, walletAddress, []);
  }

  @Get('/nft/detail/:mintAddress')
  async getNftDetail(
    @Query('chain') chain: SupportedChain.bsc | SupportedChain.goerli,
    @Param('mintAddress') mintAddress: string,
    @Param('tokenId') tokenId: string,
  ) {
    const [metadata] = await this.tokenMetadataService.getNftMetadata(chain, [
      { contractAddress: mintAddress, tokenId },
    ]);
    return {
      data: [metadata.metadata],
    };
  }

  @Get('/token/:mintAddress')
  getToken(
    @Query('chain') chain: SupportedChain.bsc | SupportedChain.goerli,
    @Param('mintAddress') mintAddress: string,
  ) {
    return this.tokenMetadataService.getTokenMetadata(chain, [mintAddress]);
  }

  @Get('/token/portfolio')
  listToken(
    @Query('chain') chain: SupportedChain.bsc | SupportedChain.goerli,
    @Query('walletAddress') walletAddress: string,
  ) {
    return this.tokenMetadataProvider.listTokenAssets(chain, walletAddress, []);
  }

  @Get('/collection/:contractAddress')
  getFloorPrice(
    @Query('chain') chain: SupportedChain.bsc | SupportedChain.goerli,
    @Param('contractAddress') contractAddress: string,
  ) {
    return this.tokenMetadataProvider.getNftFloorPrice(chain, contractAddress);
  }
}
