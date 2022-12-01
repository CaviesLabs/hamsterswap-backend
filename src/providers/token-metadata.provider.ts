import { Injectable } from '@nestjs/common';
import { NetworkProvider } from './network.provider';

@Injectable()
export class TokenMetadataProvider {
  constructor(private readonly networkProvider: NetworkProvider) {}

  listNft(address: string) {
    return this.networkProvider.request(
      `https://pro-api.solscan.io/v1.0/nft/list/${address}`,
      {
        method: 'GET',
      },
    );
  }

  getNftDetail(token: string) {
    return this.networkProvider.request(
      `https://pro-api.solscan.io/v1.0/nft/info/${token}`,
      {
        method: 'GET',
      },
    );
  }

  getListConcurrency(address: string) {
    return this.networkProvider.request(
      `https://api.solscan.io/account/v2/tokens?address=${address}`,
      {
        method: 'GET',
      },
    );
  }

  getConcurrencyDetail(token: string) {
    return this.networkProvider.request(
      `https://api.solscan.io/token/meta?token=${token}`,
      {
        method: 'GET',
      },
    );
  }
}