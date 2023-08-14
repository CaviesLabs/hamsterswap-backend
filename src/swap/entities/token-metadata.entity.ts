import { ChainId } from './swap-platform-config.entity';

export class TokenMetadataEntity {
  mintAddress: string;

  metadata: object;

  isNft: boolean;

  chainId: ChainId;
}
