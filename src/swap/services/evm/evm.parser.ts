import { Injectable } from '@nestjs/common';

import { RegistryProvider } from '../../../providers/registry.provider';
import { EvmMetadataService } from './evm-metadata.service';
import { EvmSwapProvider } from '../../../providers/evm-swap-program/swap.provider';
import {
  SwapProposalEntity,
  SwapProposalStatus,
} from '../../entities/swap-proposal.entity';
//
// /**
//  * @dev Define the item type
//  */
// enum SwapItemType {
//   Nft,
//   Currency,
// }
//
// /**
//  * @dev Define status enum
//  */
// enum SwapItemStatus {
//   Created,
//   Deposited,
//   Redeemed,
//   Withdrawn,
// }

/**
 * @dev Define proposal status
 */
enum ProposalStatus {
  Created,
  Deposited,
  Fulfilled,
  Canceled,
  Redeemed,
  Withdrawn,
}

@Injectable()
export class EvmParser {
  constructor(
    private readonly registryProvider: RegistryProvider,
    private readonly evmMetadata: EvmMetadataService,
    private readonly evmSwapProvider: EvmSwapProvider,
  ) {}

  private mapProposalStatus(status: number) {
    switch (status) {
      case ProposalStatus.Created:
        return SwapProposalStatus.CREATED;
      case ProposalStatus.Deposited:
        return SwapProposalStatus.DEPOSITED;
      case ProposalStatus.Fulfilled:
        return SwapProposalStatus.FULFILLED;
      case ProposalStatus.Canceled:
        return SwapProposalStatus.CANCELED;
      case ProposalStatus.Redeemed:
        return SwapProposalStatus.REDEEMED;
      case ProposalStatus.Withdrawn:
        return SwapProposalStatus.WITHDRAWN;
    }
  }

  public async getProposalFromOnChainData(proposalId: string) {
    const onChainProposal = await this.evmSwapProvider.getProposal(proposalId);
    // const [onChainSwapItems, onChainSwapOptions] =
    //   await this.evmSwapProvider.getSwapItemsAndOptions(proposalId);

    const proposal = new SwapProposalEntity();

    proposal.id = proposalId;
    proposal.chainId = this.evmSwapProvider.chainId;
    proposal.status = this.mapProposalStatus(
      onChainProposal.status as unknown as ProposalStatus,
    );
    proposal.ownerAddress = onChainProposal.owner;
  }
}
