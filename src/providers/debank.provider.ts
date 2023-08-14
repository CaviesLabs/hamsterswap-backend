import { NetworkProvider } from './network.provider';

export interface TokenListData {
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
  price_24h_change: number | null;
  is_verified: boolean;
  is_core: boolean;
  is_wallet: boolean;
  time_at: number | null;
  amount: number;
  raw_amount: number;
  raw_amount_hex_str: string;
}

export interface NFTListData {
  id: string;
  contract_id: string;
  inner_id: string;
  chain: string;
  name: string;
  description: string;
  content_type: string;
  content: string;
  thumbnail_url: string;
  total_supply: number;
  detail_url: string | null;
  attributes: NFTAttribute[];
  collection_id: string;
  contract_name: string;
  is_erc721: boolean;
  amount: number;
}

interface NFTAttribute {
  trait_type: string;
  value: string;
}

/**
 * @notice DebankProvider is a provider for token metadata on EVM chains
 */
export class DebankProvider {
  constructor(private readonly networkProvider: NetworkProvider) {}

  /**
   * @notice Get token balances
   * @param debankChainId
   * @param address
   */
  public getTokenBalances(debankChainId: string, address: string) {
    return this.networkProvider.request<TokenListData[]>(
      `https://pro-openapi.debank.com/v1/user/token_list?id=${address}&chain_id=${debankChainId}&is_all=false`,
      {
        method: 'GET',
      },
    );
  }

  /**
   * @notice Get NFT balances
   * @param debankChainId
   * @param address
   */
  public getNftBalances(debankChainId: string, address: string) {
    return this.networkProvider.request<NFTListData[]>(
      `https://pro-openapi.debank.com/v1/user/nft_list?id=${address}&chain_id=${debankChainId}&is_all=false`,
      {
        method: 'GET',
      },
    );
  }
}
