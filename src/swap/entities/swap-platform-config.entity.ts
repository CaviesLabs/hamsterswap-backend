export interface TokenMetadata {
  id: string;
  image: string;
}
export class SwapPlatformConfigEntity {
  maxAllowedOptions: number;

  maxAllowedItems: number;

  allowNTFCollections: TokenMetadata[];

  allowCurrencies: TokenMetadata[];
}
