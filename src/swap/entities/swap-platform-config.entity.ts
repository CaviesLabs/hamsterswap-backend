export interface TokenMetadata {
  id: string;
  image: string;
  type: string;
  name: string;
  decimals?: number;
}

export interface CollectionMetadata {
  idList: string[];
  image: string;
  type: string;
  name: string;
}

export class SwapPlatformConfigEntity {
  maxAllowedOptions: number;
  maxAllowedItems: number;
  allowNTFCollections: CollectionMetadata[];
  allowCurrencies: TokenMetadata[];
}

export interface TokenMetadata {
  id: string;
  image: string;
  type: string;
  name: string;
  decimals?: number;
}

export class SolanaConfig {
  rpcUrl: string;
  programAddress: string;
  explorerUrl: string;
  chainName: string;
  chainIcon: string;
  maxAllowedOptions: number;
  maxAllowedItems: number;
  collections: WhitelistedCollection[];
  currencies: WhitelistedCurrency[];
}

export class WhitelistedCollection {
  collectionId: string;
  addresses: string[];
  marketUrl: string;
  name: string;
  icon: string;
}

export enum ChainId {
  Solana = 'solana',
  Klaytn = 'klaytn',
}
export class WhitelistedCurrency {
  currencyId: string;
  address: string;
  decimals: number;
  explorerUrl: string;
  symbol: string;
  name: string;
  icon: string;
}

export class EVMChainConfig {
  wagmiKey: string;
  chainName: string;
  chainIcon: string;
  rpcUrl: string;
  chainId: number;
  explorerUrl: string;
  programAddress: string;
  collections: WhitelistedCollection[];
  currencies: WhitelistedCurrency[];
}

export class ChainConfigEntity {
  [ChainId.Solana]: SolanaConfig;
  [ChainId.Klaytn]: EVMChainConfig;
}
