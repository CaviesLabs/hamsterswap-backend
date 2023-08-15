import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { EvmMetadataService } from '../../services/evm/evm-metadata.service';
import { EvmBalanceService } from '../../services/evm/evm-balance.service';
import {
  GetCollectionDetailDto,
  GetNftDetailDto,
  GetTokenDetailDto,
  ListTokenBalanceDto,
} from '../../dto/metadata.dto';

@Controller('evm/metadata')
@ApiTags('evm/metadata')
export class EvmMetadataController {
  constructor(
    private readonly metadataService: EvmMetadataService,
    private readonly balanceService: EvmBalanceService,
  ) {}

  @Get('/nft/portfolio/:chainId/:walletAddress')
  listNft(@Param() query: ListTokenBalanceDto) {
    return this.balanceService.getNftBalances(
      query.chainId,
      query.walletAddress,
    );
  }

  @Get('/token/portfolio/:chainId/:walletAddress')
  listToken(@Param() query: ListTokenBalanceDto) {
    return this.balanceService.getTokenBalances(
      query.chainId,
      query.walletAddress,
    );
  }

  @Get('/nft/detail/:chainId/:contractAddress/:tokenId')
  async getNftDetail(@Param() query: GetNftDetailDto) {
    const { metadata } = await this.metadataService.getNftMetadata(
      query.chainId,
      query.contractAddress,
      query.tokenId,
    );

    return {
      data: metadata,
    };
  }

  @Get('/token/detail/:chainId/:contractAddress')
  async getToken(@Param() query: GetTokenDetailDto) {
    const { metadata } = await this.metadataService.getTokenMetadata(
      query.chainId,
      query.contractAddress,
    );

    return { data: metadata };
  }

  @Get('/collection/:chainId/:contractAddress')
  getCollectionById(@Param() query: GetCollectionDetailDto) {
    return this.metadataService.getCollectionData(
      query.chainId,
      query.contractAddress,
    );
  }
}
