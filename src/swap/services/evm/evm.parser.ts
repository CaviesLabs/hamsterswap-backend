import { Injectable } from '@nestjs/common';
import { ZeroAddress } from 'ethers';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { Entity } from '../../../providers/evm-swap-program/lib/contracts/Swap.sol/HamsterSwap';
import SwapItemStructOutput = Entity.SwapItemStructOutput;
import { RegistryProvider } from '../../../providers/registry.provider';
import { EvmMetadataService } from './evm-metadata.service';
import { EvmSwapProvider } from '../../../providers/evm-swap-program/swap.provider';
import {
  SwapProposalEntity,
  SwapProposalStatus,
} from '../../entities/swap-proposal.entity';
import {
  SwapItemEntity,
  SwapItemStatus,
  SwapItemType,
} from '../../entities/swap-item.entity';
import { ChainId } from '../../entities/swap-platform-config.entity';
import { SwapItemModel } from '../../../orm/model/swap-item.model';
import { SwapOptionEntity } from '../../entities/swap-option.entity';
import { SwapProposalModel } from '../../../orm/model/swap-proposal.model';
import { SwapOptionModel } from '../../../orm/model/swap-option.model';

/**
 * @dev Define the item type
 */
enum ItemType {
  Nft,
  Currency,
}

/**
 * @dev Define status enum
 */
enum ItemStatus {
  Created,
  Deposited,
  Redeemed,
  Withdrawn,
}

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
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  private getEvmSwapProvider(chainId: ChainId) {
    return new EvmSwapProvider(this.registryProvider, chainId);
  }

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

  private mapItemStatus(status: number) {
    switch (status) {
      case ItemStatus.Created:
        return SwapItemStatus.CREATED;
      case ItemStatus.Deposited:
        return SwapItemStatus.DEPOSITED;
      case ItemStatus.Redeemed:
        return SwapItemStatus.REDEEMED;
      case ItemStatus.Withdrawn:
        return SwapItemStatus.WITHDRAWN;
    }
  }

  private async getSwapItems(chainId: ChainId, items: SwapItemStructOutput[]) {
    return Promise.all(
      items.map(async (item) => {
        const onChainSwapItem = {
          id: item.id,
          chainId,
          status: this.mapItemStatus(item.status as unknown as ItemStatus),
          ownerAddress: item.owner,
          type:
            Number(item.itemType) === ItemType.Nft
              ? SwapItemType.NFT
              : SwapItemType.CURRENCY,
          contractAddress: item.contractAddress,
          amount: Number(item.amount),
          nftMetadata:
            Number(item.itemType) === ItemType.Nft
              ? await this.evmMetadata.getNftMetadata(
                  chainId,
                  item.contractAddress,
                  String(item.tokenId),
                )
              : await this.evmMetadata.getTokenMetadata(
                  chainId,
                  item.contractAddress,
                ),
        } as SwapItemEntity;

        return this.entityManager.create<SwapItemModel>(
          SwapItemModel,
          onChainSwapItem,
        );
      }),
    );
  }

  public async fetchProposalFromOnChainData(
    chainId: ChainId,
    proposalId: string,
  ) {
    const provider = this.getEvmSwapProvider(chainId);

    const onChainProposal = await provider.getProposal(proposalId);
    const [onChainSwapItems, onChainSwapOptions] =
      await provider.getSwapItemsAndOptions(proposalId);

    const proposal = new SwapProposalEntity();

    proposal.id = proposalId;
    proposal.chainId = provider.chainId;
    proposal.status = this.mapProposalStatus(
      onChainProposal.status as unknown as ProposalStatus,
    );
    proposal.ownerAddress = onChainProposal.owner;
    proposal.expiredAt = new Date(Number(onChainProposal.expiredAt) * 1000);

    proposal.offerItems = await this.getSwapItems(chainId, onChainSwapItems);

    proposal.swapOptions = await Promise.all(
      onChainSwapOptions.map(async (option) => {
        const onChainSwapOption = {
          id: option.id,
          chainId,
          items: await this.getSwapItems(chainId, option.askingItems),
        } as SwapOptionEntity;

        return this.entityManager.create<SwapOptionModel>(
          SwapOptionModel,
          onChainSwapOption,
        );
      }),
    );

    if (onChainProposal.fulfilledBy !== ZeroAddress) {
      proposal.fulfillBy = onChainProposal.fulfilledBy;
    }

    if (onChainProposal.fulfilledByOptionId !== '') {
      proposal.fulfilledWithOptionId = onChainProposal.fulfilledByOptionId;
    }

    if (proposal.expiredAt > new Date()) {
      proposal.status = SwapProposalStatus.EXPIRED;
    }

    const model = this.entityManager.create<SwapProposalModel>(
      SwapProposalModel,
      proposal,
    );
    model.buildSearchText();

    return model;
  }
}