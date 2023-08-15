import { IsEnum, IsEthereumAddress, IsNumberString } from 'class-validator';
import { ChainId } from '../entities/swap-platform-config.entity';

export class ListTokenBalanceDto {
  @IsEthereumAddress()
  walletAddress: string;

  @IsEnum(ChainId)
  chainId: ChainId;
}

export class GetNftDetailDto {
  @IsEnum(ChainId)
  chainId: ChainId;

  @IsEthereumAddress()
  contractAddress: string;

  @IsNumberString()
  tokenId: string;
}

export class GetTokenDetailDto {
  @IsEnum(ChainId)
  chainId: ChainId;

  @IsEthereumAddress()
  contractAddress: string;
}

export class GetCollectionDetailDto {
  @IsEnum(ChainId)
  chainId: ChainId;

  @IsEthereumAddress()
  contractAddress: string;
}
