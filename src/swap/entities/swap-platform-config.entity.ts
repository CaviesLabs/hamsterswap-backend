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
