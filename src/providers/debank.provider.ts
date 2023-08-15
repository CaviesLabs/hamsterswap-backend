import { NetworkProvider } from './network.provider';
import { RegistryProvider } from './registry.provider';
import { ChainId } from '../swap/entities/swap-platform-config.entity';

export type TokenListData = TokenInfoData & {
  price_24h_change: number | null;
  amount: number;
  raw_amount: number;
  raw_amount_hex_str: string;
};

export type NFTListData = NFTInfoData & {
  amount: number;
  total_supply: number;
};

interface NFTAttribute {
  trait_type: string;
  value: string;
}

export interface NFTInfoData {
  id: string;
  contract_id: string;
  inner_id: string;
  chain: string;
  name: string;
  description: string;
  content_type: string;
  content: string;
  thumbnail_url: string;
  detail_url: string | null;
  attributes: NFTAttribute[];
  collection_id: string;
  contract_name: string;
  is_erc721: boolean;
}

export interface TokenInfoData {
  id: string;
  chain: string;
  name: string;
  symbol: string;
  display_symbol: string | null;
  optimized_symbol: string;
  decimals: number;
  logo_url: string;
  protocol_id: string;
  price: number;
  is_verified: boolean;
  is_core: boolean;
  is_wallet: boolean;
  time_at: number | null;
}

/**
 * @notice DebankProvider is a provider for token metadata on EVM chains
 */
export class DebankProvider {
  constructor(
    private readonly registry: RegistryProvider,
    private readonly networkProvider: NetworkProvider,
  ) {}

  /**
   * @notice Get config for Debank API
   * @param chainId
   * @private
   */
  private getConfig(chainId: ChainId) {
    const apiKey = this.registry.getConfig().NETWORKS[chainId].DEBANK_API_KEY;
    const chainKey =
      this.registry.getConfig().NETWORKS[chainId].DEBANK_CHAIN_KEY;

    return {
      headers: {
        AccessKey: apiKey,
        accept: 'application/json',
      },
      chainKey,
    };
  }

  /**
   * @notice Get token balances
   * @param chainId
   * @param address
   */
  public getTokenBalances(chainId: ChainId, address: string) {
    const config = this.getConfig(chainId);

    return this.networkProvider.request<TokenListData[]>(
      `https://pro-openapi.debank.com/v1/user/token_list?id=${address}&chain_id=${config.chainKey}&is_all=false`,
      {
        method: 'GET',
        headers: config.headers,
      },
    );
  }

  /**
   * @notice Get NFT balances
   * @param chainId
   * @param address
   */
  public getNftBalances(chainId: ChainId, address: string) {
    const config = this.getConfig(chainId);

    return this.networkProvider.request<NFTListData[]>(
      `https://pro-openapi.debank.com/v1/user/nft_list?id=${address}&chain_id=${config.chainKey}&is_all=false`,
      {
        method: 'GET',
        headers: config.headers,
      },
    );
  }

  /**
   * @notice Get token info
   * @param chainId
   * @param address
   */
  public getTokenInfo(chainId: ChainId, address: string) {
    const config = this.getConfig(chainId);

    return this.networkProvider.request<TokenInfoData>(
      `https://pro-openapi.debank.com/v1/token?chain_id=${config.chainKey}&id=${address}`,
      {
        method: 'GET',
        headers: config.headers,
      },
    );
  }
}
