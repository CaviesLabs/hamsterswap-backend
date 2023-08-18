import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { TokenMetadataModel } from '../../../orm/model/token-metadata.model';
import { NetworkProvider } from '../../../providers/network.provider';
import { OpenSeaProvider } from '../../../providers/opensea.provider';
import { DebankProvider } from '../../../providers/debank.provider';
import {
  NFTMetadata,
  TokenMetadata,
} from '../../entities/token-metadata.entity';
import { ChainId } from '../../entities/swap-platform-config.entity';
import { RegistryProvider } from '../../../providers/registry.provider';

@Injectable()
export class EvmMetadataService {
  private readonly openseaProvider: OpenSeaProvider;
  private readonly debankProvider: DebankProvider;
  constructor(
    @InjectRepository(TokenMetadataModel)
    private readonly tokenMetadataRepo: Repository<TokenMetadataModel>,
    private readonly networkProvider: NetworkProvider,
    private readonly registry: RegistryProvider,
  ) {
    this.openseaProvider = new OpenSeaProvider(
      this.registry,
      this.networkProvider,
    );
    this.debankProvider = new DebankProvider(
      this.registry,
      this.networkProvider,
    );
  }

  /**
   * @notice Get token metadata from opensea
   * @param chainId
   * @param contractAddress
   * @param tokenId
   */
  public async getNftMetadata(
    chainId: ChainId,
    contractAddress: string,
    tokenId: string,
  ): Promise<TokenMetadataModel> {
    const existedTokenMetadata = await this.tokenMetadataRepo.findOneBy({
      mintAddress: `${chainId}:${contractAddress}:${tokenId}`,
    });

    if (existedTokenMetadata) {
      return existedTokenMetadata;
    }

    const { nft: data } = await this.openseaProvider.getOpenSeaNftData(
      chainId,
      contractAddress,
      tokenId,
    );

    const collection = this.registry.findCollection(chainId, contractAddress);

    const nftMetadata: NFTMetadata = {
      id: tokenId,
      address: contractAddress,
      attributes: data.traits,
      image: data.image_url,
      name: data.name,
      collectionId: `${chainId}:${contractAddress}`,
      collectionSlug: data.collection,
      isWhiteListed: !!collection,
      collectionName: collection?.name,
      collectionUrl: collection?.marketUrl,
      chainId,
    };

    return this.persistNftMetadata(chainId, contractAddress, nftMetadata);
  }

  /**
   * @notice Get token metadata from debank
   * @param chainId
   * @param tokenAddress
   */
  public async getTokenMetadata(
    chainId: ChainId,
    tokenAddress: string,
  ): Promise<TokenMetadataModel> {
    const existedTokenMetadata = await this.tokenMetadataRepo.findOneBy({
      mintAddress: `${chainId}:${tokenAddress}`,
    });

    if (existedTokenMetadata) {
      return existedTokenMetadata;
    }

    const data = await this.debankProvider.getTokenInfo(chainId, tokenAddress);

    const tokenMetadata: TokenMetadata = {
      icon: data.logo_url,
      name: data.name,
      symbol: data.symbol,
      address: tokenAddress,
      decimals: data.decimals,
      isWhiteListed: !!this.registry.findToken(chainId, tokenAddress),
      chainId,
    };

    return this.persistTokenMetadata(chainId, tokenAddress, tokenMetadata);
  }

  /**
   * @notice Persist token metadata
   * @param chainId
   * @param contractAddress
   * @param data
   */
  public persistTokenMetadata(
    chainId: ChainId,
    contractAddress: string,
    data: TokenMetadata,
  ): Promise<TokenMetadataModel> {
    return this.tokenMetadataRepo.save({
      mintAddress: `${chainId}:${contractAddress}`,
      metadata: data,
      isNft: false,
      chainId,
    });
  }

  /**
   * @notice Persist nft metadata
   * @param chainId
   * @param contractAddress
   * @param data
   */
  public persistNftMetadata(
    chainId: ChainId,
    contractAddress: string,
    data: NFTMetadata,
  ): Promise<TokenMetadataModel> {
    return this.tokenMetadataRepo.save({
      mintAddress: `${chainId}:${contractAddress}:${data.id}`,
      metadata: data,
      isNft: true,
      chainId,
    });
  }

  /**
   * @notice Get collection data
   * @param chainId
   * @param collectionId
   */
  public getCollectionData(chainId: ChainId, collectionId: string) {
    return this.registry.findCollection(chainId, collectionId);
  }
}
