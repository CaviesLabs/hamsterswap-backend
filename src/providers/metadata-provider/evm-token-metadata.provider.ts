import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import { Injectable } from '@nestjs/common';

import { RegistryProvider, SupportedChain } from '../registry.provider';

/**
 * @dev Mapping supported chain
 */
export const SupportedChainMapping = {
  [SupportedChain.goerli]: EvmChain.GOERLI,
  [SupportedChain.bsc]: EvmChain.BSC,
};

/**
 * @dev EVM token metadata
 */
@Injectable()
export class EvmTokenMetadataProvider {
  /**
   * @dev Instance
   * @private
   */
  private readonly instance: typeof Moralis = Moralis;

  /**
   * @dev Indicates that the provider was initialized or not
   * @private
   */
  private isInitialized = false;

  /**
   * @dev Initialize instance
   * @private
   */
  private async getInstance() {
    if (this.isInitialized) {
      return this.instance;
    }

    await Moralis.start({
      apiKey: new RegistryProvider().getConfig().MORALIS_API_KEY,
    });

    this.isInitialized = true;

    return Moralis;
  }

  /**
   * @dev List NFT assets
   * @param chain
   * @param owner
   * @param whitelistedTokenAddresses
   */
  public async listNFTAssets(
    chain: SupportedChain,
    owner: string,
    whitelistedTokenAddresses: string[],
  ) {
    const instance = await this.getInstance();

    /**
     * @dev Calling Moralis API
     */
    return instance.EvmApi.nft.getWalletNFTs({
      address: owner,
      tokenAddresses: whitelistedTokenAddresses,
      chain: SupportedChainMapping[chain],
    });
  }

  /**
   * @dev List token assets
   * @param chain
   * @param owner
   * @param whitelistedTokenAddresses
   */
  public async listTokenAssets(
    chain: SupportedChain,
    owner: string,
    whitelistedTokenAddresses: string[],
  ) {
    const instance = await this.getInstance();

    /**
     * @dev Calling Moralis API
     */
    return instance.EvmApi.token.getWalletTokenBalances({
      address: owner,
      tokenAddresses: whitelistedTokenAddresses,
      chain: SupportedChainMapping[chain],
    });
  }

  /**
   * @dev Metadata API
   * @param chain
   * @param contractAddress
   * @param tokenId
   */
  public async getNFTMetadata(
    chain: SupportedChain,
    contractAddress: string,
    tokenId: string,
  ) {
    const instance = await this.getInstance();

    return instance.EvmApi.nft.getNFTMetadata({
      tokenId,
      address: contractAddress,
      chain: SupportedChainMapping[chain],
    });
  }

  /**
   * @dev Get token metadata
   * @param chain
   * @param contractAddresses
   */
  public async getTokenMetadata(
    chain: SupportedChain,
    contractAddresses: string[],
  ) {
    const instance = await this.getInstance();

    return instance.EvmApi.token.getTokenMetadata({
      addresses: contractAddresses,
      chain: SupportedChainMapping[chain],
    });
  }

  /**
   * @dev Get token metadata
   * @param chain
   * @param contractAddress
   */
  public async getNftFloorPrice(
    chain: SupportedChain,
    contractAddress: string,
  ) {
    const instance = await this.getInstance();

    return instance.EvmApi.nft.getNFTLowestPrice({
      address: contractAddress,
      chain: SupportedChainMapping[chain],
    });
  }

  /**
   * @dev Get token metadata
   * @param chain
   * @param contractAddress
   */
  public async getTokenPrice(chain: SupportedChain, contractAddress: string) {
    const instance = await this.getInstance();

    return instance.EvmApi.token.getTokenPrice({
      address: contractAddress,
      chain: SupportedChainMapping[chain],
    });
  }
}
