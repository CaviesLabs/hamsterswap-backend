import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { In, Repository } from 'typeorm';

import { TokenMetadataModel } from '../../orm/model/token-metadata.model';
import { TokenMetadataEntity } from '../entities/token-metadata.entity';
import { EvmTokenMetadataProvider } from '../../providers/metadata-provider/evm-token-metadata.provider';
import { SupportedChain } from '../../providers/registry.provider';
import { AccountToken } from '../entities/metadata.entity';

@Injectable()
export class EvmTokenMetadataService {
  constructor(
    private readonly tokenMetadataProvider: EvmTokenMetadataProvider,
    @InjectRepository(TokenMetadataModel)
    private readonly tokenMetadataRepo: Repository<TokenMetadataModel>,
  ) {}

  /**
   * @dev Fetch NFT metadata
   * @param chain
   * @param queryData
   * @private
   */
  private async fetchNftMetadata(
    chain: SupportedChain,
    queryData: { contractAddress: string; tokenId: string }[],
  ): Promise<TokenMetadataEntity[]> {
    return Promise.all(
      queryData.map(async (query) => {
        const data = await this.tokenMetadataProvider.getNFTMetadata(
          chain,
          query.contractAddress,
          query.tokenId,
        );

        /**
         * @dev Returning the metadata of evm
         */
        return {
          mintAddress: query.contractAddress,
          metadata: {
            token_id: query.tokenId,
            ...data.toJSON().normalized_metadata,
          },
          isNft: true,
        };
      }),
    );
  }

  /**
   * @dev Get NFT data with cached
   * @param chain
   * @param queryData
   */
  public async getNftMetadata(
    chain: SupportedChain,
    queryData: { contractAddress: string; tokenId: string }[],
  ): Promise<TokenMetadataEntity[]> {
    const mintAddress = queryData.map((elm) => elm.contractAddress);
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

    const wildNftMetadata = await this.fetchNftMetadata(chain, queryData);
    const newMetadata = await this.tokenMetadataRepo.save(wildNftMetadata);

    return plainToInstance(TokenMetadataEntity, [
      ...existedTokenMetadata,
      ...newMetadata,
    ]);
  }

  /**
   * @dev Fetch NFT metadata
   * @param chain
   * @param queryData
   * @private
   */
  private async fetchTokenMetadata(
    chain: SupportedChain,
    queryData: string[],
  ): Promise<TokenMetadataEntity[]> {
    const data = await this.tokenMetadataProvider.getTokenMetadata(
      chain,
      queryData,
    );

    return Promise.all(
      data.toJSON().map(async (query) => {
        /**
         * @dev Returning the metadata of evm
         */
        return {
          mintAddress: query.address,
          metadata: query,
          isNft: false,
        };
      }),
    );
  }

  /**
   * @dev Get NFT data with cached
   * @param chain
   * @param contractAddresses
   */
  public async getTokenMetadata(
    chain: SupportedChain,
    contractAddresses: string[],
  ): Promise<TokenMetadataEntity[]> {
    const existedTokenMetadata = await this.tokenMetadataRepo.findBy({
      mintAddress: In(contractAddresses),
    });

    const wildMintAddresses: string[] = [];
    contractAddresses.forEach((mintAddress) => {
      if (
        !existedTokenMetadata.find(
          (existed) => existed.mintAddress === mintAddress,
        )
      ) {
        wildMintAddresses.push(mintAddress);
      }
    });

    const wildNftMetadata = await this.fetchTokenMetadata(
      chain,
      wildMintAddresses,
    );
    const newMetadata = await this.tokenMetadataRepo.save(wildNftMetadata);

    return plainToInstance(TokenMetadataEntity, [
      ...existedTokenMetadata,
      ...newMetadata,
    ]);
  }

  /**
   * @dev Get nfts in wallet with normalized data
   * @param chain
   * @param ownerAddress
   * @param whitelistedAddresses
   */
  public async getNftsByWallet(
    chain: SupportedChain,
    ownerAddress: string,
    whitelistedAddresses: string[],
  ): Promise<AccountToken[]> {
    /**
     * @dev fetch wallet's tokens
     */
    const tokens = await this.tokenMetadataProvider.listNFTAssets(
      chain,
      ownerAddress,
      whitelistedAddresses,
    );

    /**
     * @dev get corresponding NFTs metadata
     */
    const accountNfts: Array<AccountToken | null> = tokens
      .toJSON()
      .result.map((meta) => {
        return {
          nft_address: meta.token_id,
          nft_name: meta.name,
          nft_symbol: meta.symbol,
          nft_status: 'holding',
          nft_collection_id: meta.token_address,
          nft_image_uri: meta.normalized_metadata.image,
        };
      });

    /**
     * @dev return only NFTs
     */
    return accountNfts.filter((nft) => nft != null);
  }
}
