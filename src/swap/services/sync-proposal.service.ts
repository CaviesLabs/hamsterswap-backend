import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { SwapItemModel } from '../../orm/model/swap-item.model';
import { SwapOptionModel } from '../../orm/model/swap-option.model';
import { SwapProposalModel } from '../../orm/model/swap-proposal.model';
import { SwapProgramProvider } from '../../providers/swap-program/swap-program.provider';
import {
  OCSwapItem,
  OCSwapOption,
} from '../../providers/swap-program/swap.type';
import { TokenMetadataProvider } from '../../providers/token-metadata.provider';
import { OCSwapItemDto } from '../onchain-dto/oc-swap-item.dto';
import { OCSwapOptionDto } from '../onchain-dto/oc-swap-option.dto';
import { OCSwapProposalDto } from '../onchain-dto/oc-swap-proposal.dto';
import { isIdsMatched } from '../onchain-dto/primitive.helper';

@Injectable()
export class SyncSwapProposalService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectRepository(SwapProposalModel)
    private readonly swapProposalRepo: Repository<SwapProposalModel>,
    private readonly swapProgramProvider: SwapProgramProvider,
    private readonly tokenMetadataProvider: TokenMetadataProvider,
  ) {}

  private async getSwapItem(
    ocItem: OCSwapItem,
    dbItem: SwapItemModel,
  ): Promise<SwapItemModel> {
    const item = new OCSwapItemDto(ocItem, dbItem);
    item.nftMetadata = await this.tokenMetadataProvider.getNftDetail(
      item.contractAddress,
    );

    return this.entityManager.create<SwapItemModel>(SwapItemModel, item);
  }

  private async getSwapItems(
    ocItems: OCSwapItem[],
    existedItems: SwapItemModel[] = [],
  ): Promise<SwapItemModel[]> {
    return Promise.all(
      ocItems.map(async (ocItem) => {
        const dbItem = existedItems.find(({ id }) =>
          isIdsMatched(ocItem.id, id),
        );

        return this.getSwapItem(ocItem, dbItem);
      }),
    );
  }

  private async getSwapOptions(
    ocSwapOptions: OCSwapOption[],
    existedSwapOptions: SwapOptionModel[] = [],
  ): Promise<SwapOptionModel[]> {
    return Promise.all(
      ocSwapOptions.map(async (ocSwapOption) => {
        const dbSwapOption = existedSwapOptions.find(({ id }) =>
          isIdsMatched(ocSwapOption.id, id),
        );

        const option = this.entityManager.create<SwapOptionModel>(
          SwapOptionModel,
          new OCSwapOptionDto(ocSwapOption, dbSwapOption),
        );

        option.items = await this.getSwapItems(
          ocSwapOption.askingItems as OCSwapItem[],
          dbSwapOption?.items || [],
        );

        return option;
      }),
    );
  }

  public async syncById(id: string) {
    const proposalExisted = await this.swapProposalRepo.findOne({
      where: { id },
      relations: { offerItems: true, swapOptions: { items: true } },
    });
    if (!proposalExisted) {
      throw new NotFoundException('SWAP::PROPOSAL_NOTFOUND');
    }

    const ocProposal = await this.swapProgramProvider.getSwapProposal(id);

    const proposal = this.entityManager.create(
      SwapProposalModel,
      new OCSwapProposalDto(ocProposal, proposalExisted),
    );

    proposal.offerItems = await this.getSwapItems(
      ocProposal.offeredItems as OCSwapItem[],
      proposalExisted.offerItems,
    );

    proposal.swapOptions = await this.getSwapOptions(
      ocProposal.swapOptions as OCSwapOption[],
      proposalExisted.swapOptions,
    );

    if (ocProposal.fulfilledWithOptionId) {
      const selectedOption = proposal.swapOptions.find(({ id }) =>
        isIdsMatched(ocProposal.fulfilledWithOptionId, id),
      );

      proposal.fulfilledWithOptionId = selectedOption?.id;
    }

    await this.swapProposalRepo.save(proposal);
  }
}
