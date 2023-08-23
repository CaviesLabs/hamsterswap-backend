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

  public async getMultipleProposals(proposalIds: string[]) {
    const calls = [];

    await Promise.all(
      proposalIds.map(async (id) => {
        const fetchProposal = {
          target: await this.swapContract.getAddress(),
          callData: this.swapContract.interface.encodeFunctionData(
            'proposals',
            [id],
          ),
          allowFailure: false,
        };

        const fetchSwapItemsAndOptions = {
          target: await this.swapContract.getAddress(),
          callData: this.swapContract.interface.encodeFunctionData(
            'getProposalItemsAndOptions',
            [id],
          ),
          allowFailure: false,
        };
        calls.push(fetchProposal, fetchSwapItemsAndOptions);
      }),
    );

    const callResults = await this.multicall3Contract.aggregate3.staticCall(
      calls,
    );

    const proposals = [];

    for (let index = 0; index < callResults.length; index += 2) {
      // skip failed calls
      if (callResults[index].success === false) {
        continue;
      }

      // decode proposal
      const proposal = this.swapContract.interface.decodeFunctionResult(
        'proposals',
        callResults[index].returnData,
      );

      // decode swap items and options
      const swapItemsAndOptions =
        this.swapContract.interface.decodeFunctionResult(
          'getProposalItemsAndOptions',
          callResults[index + 1].returnData,
        );

      proposals.push({
        proposal,
        swapItems: swapItemsAndOptions[0],
        swapOptions: swapItemsAndOptions[1],
      });
    }

    return proposals;
  }

  public getProposal(proposalId: string) {
    return this.swapContract.proposals(proposalId);
  }

  public getSwapItemsAndOptions(proposalId: string) {
    return this.swapContract.getProposalItemsAndOptions(proposalId);
  }
}
