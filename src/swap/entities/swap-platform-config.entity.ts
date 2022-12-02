export interface TokenMetadata {
  id: string;
  image: string;
  type: string;
  name: string;
}
export class SwapPlatformConfigEntity {
  maxAllowedOptions: number;

  maxAllowedItems: number;

  allowNTFCollections: TokenMetadata[];

  allowCurrencies: TokenMetadata[];
}
