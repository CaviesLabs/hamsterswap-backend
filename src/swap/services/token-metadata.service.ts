import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { In, Repository } from 'typeorm';

import { TokenMetadataModel } from '../../orm/model/token-metadata.model';
import {
  AccountToken,
  AccountTokenDetail,
  TokenMetadataProvider,
} from '../../providers/token-metadata.provider';
import { TokenMetadataEntity } from '../entities/token-metadata.entity';

@Injectable()
export class TokenMetadataService {
  constructor(
    private readonly tokenMetadataProvider: TokenMetadataProvider,
    @InjectRepository(TokenMetadataModel)
    private readonly tokenMetadataRepo: Repository<TokenMetadataModel>,
  ) {}

  private async fetchNftMetadata(
    mintAddress: string[],
  ): Promise<TokenMetadataEntity[]> {
    const metadata = await Promise.all(
      mintAddress.map(async (address) => {
        const { data } = await this.tokenMetadataProvider.getNftDetail(address);
        return {
          mintAddress: address,
          metadata: data[0],
          isNft: !!data[0],
        };
      }),
    );

    return metadata;
  }

  public async getNftMetadata(
    mintAddress: string[],
  ): Promise<TokenMetadataEntity[]> {
    const existedTokenMetadata = await this.tokenMetadataRepo.findBy({
      mintAddress: In(mintAddress),
    });

    const wildMintAddresses: string[] = [];
    mintAddress.forEach((mintAddress) => {
      if (
        !existedTokenMetadata.find(
          (existed) => existed.mintAddress === mintAddress,
        )
      ) {
        wildMintAddresses.push(mintAddress);
      }
    });

    const wildNftMetadata = await this.fetchNftMetadata(wildMintAddresses);
    const newMetadata = await this.tokenMetadataRepo.save(wildNftMetadata);

    return plainToInstance(TokenMetadataEntity, [
      ...existedTokenMetadata,
      ...newMetadata,
    ]);
  }

  public async getNftsByWallet(address: string): Promise<AccountToken[]> {
    /**
     * @dev fetch wallet's tokens
     */
    const tokens = await this.tokenMetadataProvider.listNftV1(address);

    const tokenMetadata = await this.getNftMetadata(
      tokens.data.map(({ tokenAddress }) => tokenAddress),
    );

    /**
     * @dev get corresponding NFTs metadata
     */
    const accountNfts: Array<AccountToken | null> = tokens.data.map(
      ({ tokenAddress }) => {
        const nft = tokenMetadata.find(
          ({ mintAddress }) => mintAddress === tokenAddress,
        );

        if (!nft.isNft) return null;

        const meta = nft.metadata as AccountTokenDetail;
        return {
          nft_address: meta.nft_address,
          nft_name: meta.nft_name,
          nft_symbol: meta.nft_symbol,
          nft_status: 'holding',
          nft_collection_id: meta.nft_collection_id,
          nft_image_uri: meta.nft_image,
        };
      },
    );

    /**
     * @dev return only NFTs
     */
    return accountNfts.filter((nft) => nft != null);
  }
}
