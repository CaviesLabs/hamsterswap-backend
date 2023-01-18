export interface TokenMetadata {
  id: string;
  image: string;
  type: string;
  name: string;
  decimals?: number;
}
export class SwapPlatformConfigEntity {
  maxAllowedOptions: number;

  maxAllowedItems: number;

  allowNTFCollections: TokenMetadata[];

  allowCurrencies: TokenMetadata[];
}
