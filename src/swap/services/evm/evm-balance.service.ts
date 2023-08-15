import { Injectable } from '@nestjs/common';

import { NetworkProvider } from '../../../providers/network.provider';
import { OpenSeaProvider } from '../../../providers/opensea.provider';
import { DebankProvider } from '../../../providers/debank.provider';
import { RegistryProvider } from '../../../providers/registry.provider';
import { EvmMetadataService } from './evm-metadata.service';
import { ChainId } from '../../entities/swap-platform-config.entity';
import {
  NFTBalanceEntity,
  TokenBalanceEntity,
} from '../../entities/token-balance.entity';
import { TokenMetadata } from '../../entities/token-metadata.entity';

@Injectable()
export class EvmBalanceService {
  private readonly openseaProvider: OpenSeaProvider;
  private readonly debankProvider: DebankProvider;

  constructor(
    private readonly evmMetadataService: EvmMetadataService,
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
   * @notice Get token balance from debank.
   * @param chainId
   * @param ownerAddress
   */
  public async getTokenBalances(
    chainId: ChainId,
    ownerAddress: string,
  ): Promise<TokenBalanceEntity[]> {
    const rawTokenBalances = await this.debankProvider.getTokenBalances(
      chainId,
      ownerAddress,
    );

    /**
     * @notice Return token balance.
     */
    return rawTokenBalances.map((balance) => {
      const metadata = {
        icon: balance.logo_url,
        name: balance.name,
        symbol: balance.symbol,
        decimals: balance.decimals,
        address: balance.id,
        chainId,
        isWhiteListed: !!this.registry.findToken(chainId, balance.id),
      } as TokenMetadata;

      return {
        ...metadata,
        amount: balance.amount,
        rawAmount: balance.raw_amount,
        rawAmountHex: balance.raw_amount_hex_str,
      } as TokenBalanceEntity;
    });
  }

  /**
   * @notice Get nft balance from debank.
   * @param chainId
   * @param ownerAddress
   */
  public async getNftBalances(
    chainId: ChainId,
    ownerAddress: string,
  ): Promise<NFTBalanceEntity[]> {
    const rawNftBalances = await this.debankProvider.getNftBalances(
      chainId,
      ownerAddress,
    );

    return rawNftBalances.map((balance) => {
      return {
        id: balance.inner_id,
        address: balance.contract_id,
        chainId,
        collectionId: `${chainId}:${balance.contract_id}`,
        collectionSlug: this.registry.findCollection(
          chainId,
          balance.contract_id,
        )?.collectionId,
        isWhiteListed: !!this.registry.findCollection(
          chainId,
          balance.contract_id,
        ),
        image: balance.content,
        name: balance.name,
        attributes: balance.attributes,
      };
    });
  }
}
