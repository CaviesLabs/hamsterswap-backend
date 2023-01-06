export interface AccountV1Token {
  owner: string;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
}

export interface AccountToken {
  nft_address: string;
  nft_name: string;
  nft_symbol: string;
  nft_status: string;
  nft_collection_id: string;
  nft_image_uri: string;
}

export interface AccountTokenDetail {
  nft_address: string;
  nft_name: string;
  nft_symbol: string;
  nft_image: string;
  nft_collection_id: string;
  nft_collection_name: string;
}

export interface CurrencyData {
  symbol: string;
  address: string;
  name: string;
  icon: string;
  website: string;
  twitter: string;
  decimals: number;
  coingeckoId: string;
  holder: number;
}
