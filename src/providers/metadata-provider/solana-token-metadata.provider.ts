import { Injectable } from '@nestjs/common';

import { NetworkProvider } from '../network.provider';
import {
  AccountToken,
  AccountTokenDetail,
  AccountV1Token,
  CurrencyData,
} from '../../swap/entities/metadata.entity';

@Injectable()
export class SolanaTokenMetadataProvider {
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

  listCurrency(address: string) {
    return this.networkProvider.request(
      `https://api.solscan.io/account/v2/tokens?address=${address}`,
      {
        method: 'GET',
      },
    );
  }

  getCurrencyDetail(token: string) {
    return this.networkProvider.request<{ data: CurrencyData }>(
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
