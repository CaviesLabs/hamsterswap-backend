import { ethers } from 'ethers';

import { RegistryProvider } from '../registry.provider';
import {
  HamsterSwap,
  HamsterSwap__factory,
  Multicall3,
  Multicall3__factory,
} from './lib';
import { ChainId } from '../../swap/entities/swap-platform-config.entity';

export class EvmSwapProvider {
  private readonly swapContract: HamsterSwap;
  private readonly multicall3Contract: Multicall3;

  constructor(
    private readonly registryProvider: RegistryProvider,
    public readonly chainId: ChainId,
  ) {
    if (this.chainId === ChainId.Solana) {
      throw new Error('CHAIN_ID_NOT_SUPPORTED: solana');
    }

    const provider = new ethers.JsonRpcProvider(
      this.registryProvider.getChainConfig()[this.chainId].rpcUrl,
    );

    this.swapContract = HamsterSwap__factory.connect(
      this.registryProvider.getChainConfig()[this.chainId].programAddress,
      provider,
    );

    this.multicall3Contract = Multicall3__factory.connect(
      this.registryProvider.getConfig().NETWORKS[this.chainId]
        .MULTICALL3_PROGRAM_ADDRESS, // only evm contains Multicall3 contract
      provider,
    );
  }
}
