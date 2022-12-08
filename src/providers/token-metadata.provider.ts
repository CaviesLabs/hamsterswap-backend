import { Injectable } from '@nestjs/common';
import { NetworkProvider } from './network.provider';

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

@Injectable()
export class TokenMetadataProvider {
  constructor(private readonly networkProvider: NetworkProvider) {}

  listNft(address: string) {
    return this.networkProvider.request<{
      data: { list_nft: AccountToken[] };
    }>(`https://pro-api.solscan.io/v1.0/nft/list/${address}`, {
      method: 'GET',
    });
  }

  listNftV1(address: string) {
    return this.networkProvider.request<{ data: AccountV1Token[] }>(
      `https://api.solscan.io/account/v2/tokens?address=${address}`,
      {
        method: 'GET',
      },
    );
  }

  getNftDetail(token: string) {
    return this.networkProvider.request<{ data: AccountTokenDetail[] }>(
      `https://pro-api.solscan.io/v1.0/nft/info/${token}`,
      {
        method: 'GET',
      },
    );
  }

  listConcurrency(address: string) {
    return this.networkProvider.request(
      `https://api.solscan.io/account/v2/tokens?address=${address}`,
      {
        method: 'GET',
      },
    );
  }

  getConcurrencyDetail(token: string) {
    return this.networkProvider.request<{ data: object }>(
      `https://api.solscan.io/token/meta?token=${token}`,
      {
        method: 'GET',
      },
    );
  }

  getCollection(collectionId: string) {
    return this.networkProvider.request<{ data: object }>(
      `https://api.solscan.io/collection/id?collectionId=${collectionId}`,
      {
        method: 'GET',
      },
    );
  }
}
