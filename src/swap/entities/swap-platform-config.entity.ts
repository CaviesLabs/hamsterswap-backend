export interface TokenMetadata {
  id: string;
  image: string;
  type: string;
  name: string;
}
export class SwapPlatformConfigEntity {
  maxAllowedOptions: number;
  maxAllowedItems: number;

  solana: {
    allowNTFCollections: TokenMetadata[];
    allowCurrencies: TokenMetadata[];
  };

  goerli: {
    allowNTFCollections: TokenMetadata[];
    allowCurrencies: TokenMetadata[];
  };

  bsc: {
    allowNTFCollections: TokenMetadata[];
    allowCurrencies: TokenMetadata[];
  };
}
