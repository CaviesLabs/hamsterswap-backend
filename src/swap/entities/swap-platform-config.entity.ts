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
  chainLogo: string;
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
  logo: string;
}

export class WhitelistedCurrency {
  currencyId: string;
  address: string;
  decimals: number;
  explorerUrl: string;
  symbol: string;
  name: string;
  logo: string;
}

export class EVMChainConfig {
  wagmiKey: string;
  chainName: string;
  chainLogo: string;
  rpcUrl: string;
  chainId: number;
  explorerUrl: string;
  programAddress: string;
  collections: WhitelistedCollection[];
  currencies: WhitelistedCurrency[];
}

export class ChainConfigEntity {
  solana: SolanaConfig;
  klaytn: EVMChainConfig;
}
