import { ChainId } from './swap-platform-config.entity';

export class TokenMetadataEntity {
  mintAddress: string;
  metadata: TokenMetadata | NFTMetadata;
  isNft: boolean;
  chainId: ChainId;
}

export interface TokenMetadata {
  icon: string;
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  chainId: ChainId;
  isWhiteListed: boolean;
}

export interface NFTMetadata {
  id: string;
  name: string;
  image: string;
  address: string;
  attributes: NFTAttribute[];
  collectionId: string;
  collectionSlug: string;
  isWhiteListed: boolean;
  chainId: ChainId;
}

interface NFTAttribute {
  value: string | number | boolean;
  trait_type: string;
}
