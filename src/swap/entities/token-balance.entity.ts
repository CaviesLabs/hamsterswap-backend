import { NFTMetadata, TokenMetadata } from './token-metadata.entity';

export type TokenBalanceEntity = TokenMetadata & {
  amount: number;
  rawAmount: number;
  rawAmountHex: string;
};

export type NFTBalanceEntity = NFTMetadata;
