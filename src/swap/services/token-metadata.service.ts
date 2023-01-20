import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { DateTime } from 'luxon';
import { In, MoreThan, Repository } from 'typeorm';

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
        const { data } = await this.tokenMetadataProvider.getNftDetailV2(
          address,
        );
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
    mintAddress: string,
    forceUpdate = false,
  ): Promise<TokenMetadataEntity> {
    /** Skip cache if force update */
    if (!forceUpdate) {
      const existedTokenMetadata = await this.tokenMetadataRepo.findOneBy({
        mintAddress,
        updatedAt: MoreThan(DateTime.now().minus({ days: 15 }).toJSDate()),
      });
      if (!!existedTokenMetadata) return existedTokenMetadata;
    }

    const { data } = await this.tokenMetadataProvider.getNftDetailV2(
      mintAddress,
    );

    /** Upsert token metadata */
    await this.tokenMetadataRepo.upsert(
      [
        {
          mintAddress,
          metadata: data[0],
          isNft: true,
        },
      ],
      ['mintAddress'],
    );

    /** Return new data */
    return this.tokenMetadataRepo.findOneBy({ mintAddress });
  }

  public async listNftMetadata(
    mintAddresses: string[],
    forceUpdate = false,
  ): Promise<TokenMetadataEntity[]> {
    let existedTokenMetadata: TokenMetadataEntity[] = [];

    /** Skip cache if force update */
    if (!forceUpdate) {
      existedTokenMetadata = await this.tokenMetadataRepo.findBy({
        mintAddress: In(mintAddresses),
        updatedAt: MoreThan(DateTime.now().minus({ days: 15 }).toJSDate()),
      });
    }

    /** Filter new or too old metadata */
    const wildMintAddresses: string[] = [];
    mintAddresses.forEach((mintAddress) => {
      if (
        !existedTokenMetadata.find(
          (existed) => existed.mintAddress === mintAddress,
        )
      ) {
        wildMintAddresses.push(mintAddress);
      }
    });

    /** Fetch metadata */
    const wildNftMetadata = await this.fetchNftMetadata(wildMintAddresses);

    /** Upsert metadata */
    await this.tokenMetadataRepo.upsert(wildNftMetadata, ['mintAddress']);

    /** Get new update */
    const newMetadata = await this.tokenMetadataRepo.findBy({
      mintAddress: In(wildMintAddresses),
    });

    return plainToInstance(TokenMetadataEntity, [
      ...existedTokenMetadata,
      ...newMetadata,
    ]);
  }

  public async listNftsByWallet(address: string): Promise<AccountToken[]> {
    /**
     * @dev fetch wallet's tokens
     */
    const tokens = await this.tokenMetadataProvider.listNftV1(address);

    const tokenMetadata = await this.listNftMetadata(
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

  public async getCurrency(
    mintAddress: string,
    forceUpdate = false,
  ): Promise<TokenMetadataEntity> {
    /** Skip cache if force update */
    if (!forceUpdate) {
      const existedTokenMetadata = await this.tokenMetadataRepo.findOneBy({
        mintAddress,
        updatedAt: MoreThan(DateTime.now().minus({ days: 15 }).toJSDate()),
      });
      if (!!existedTokenMetadata) return existedTokenMetadata;
    }

    /** Fetch metadata */
    const { data } = await this.tokenMetadataProvider.getCurrencyDetail(
      mintAddress,
    );

    /** Upsert metadata */
    await this.tokenMetadataRepo.upsert(
      [
        {
          mintAddress,
          metadata: data,
          isNft: false,
        },
      ],
      ['mintAddress'],
    );

    /** Return new update */
    return this.tokenMetadataRepo.findOneBy({ mintAddress });
  }
}
