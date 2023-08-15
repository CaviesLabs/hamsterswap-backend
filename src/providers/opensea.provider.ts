import { NetworkProvider } from './network.provider';
import { RegistryProvider } from './registry.provider';
import { ChainId } from '../swap/entities/swap-platform-config.entity';

interface Trait {
  trait_type: string;
  display_type: string | null;
  max_value: number | null;
  trait_count: number;
  order: number | null;
  value: string;
}

interface Owner {
  address: string;
  quantity: number;
}

interface Rarity {
  strategy_id: string;
  strategy_version: string;
  rank: number;
  score: number;
  calculated_at: string;
  max_rank: number;
  tokens_scored: number;
  ranking_features: {
    unique_attribute_count: number;
  };
}

export interface NFTWithDetails {
  identifier: string;
  collection: string;
  contract: string;
  token_standard: string;
  name: string;
  description: string;
  image_url: string;
  metadata_url: string;
  created_at: string;
  updated_at: string;
  is_disabled: boolean;
  is_nsfw: boolean;
  is_suspicious: boolean;
  creator: any | null; // Replace 'any' with a specific type if needed
  traits: Trait[];
  owners: Owner[];
  rarity: Rarity;
}

/**
 * @notice TokenEvmMetadataProvider is a provider for token metadata on EVM chains
 */
export class OpenSeaProvider {
  constructor(
    private readonly registry: RegistryProvider,
    private readonly networkProvider: NetworkProvider,
  ) {}

  /**
   * @notice Get config for OpenSea API
   * @param chainId
   * @private
   */
  private getConfig(chainId: ChainId) {
    const apiKey = this.registry.getConfig().NETWORKS[chainId].OPENSEA_API_KEY;
    const chainKey =
      this.registry.getConfig().NETWORKS[chainId].OPENSEA_CHAIN_KEY;

    return {
      headers: {
        'X-API-KEY': apiKey,
        accept: 'application/json',
      },
      chainKey,
    };
  }

  /**
   * @notice Get NFT data from OpenSea API
   * @param chainId
   * @param nftContractAddress
   * @param tokenId
   */
  public getOpenSeaNftData(
    chainId: ChainId,
    nftContractAddress: string,
    tokenId: string,
  ): Promise<{ nft: NFTWithDetails }> {
    const config = this.getConfig(chainId);

    return this.networkProvider.request<{ nft: NFTWithDetails }>(
      `https://api.opensea.io/v2/chain/${config.chainKey}/contract/${nftContractAddress}/nfts/${tokenId}`,
      {
        method: 'GET',
        headers: config.headers,
      },
    );
  }
}
