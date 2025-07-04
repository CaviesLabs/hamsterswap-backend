import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Between, EntityManager, In, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

import { SwapItemModel } from '../../../orm/model/swap-item.model';
import { SwapOptionModel } from '../../../orm/model/swap-option.model';
import { SwapProposalModel } from '../../../orm/model/swap-proposal.model';
import { SwapProgramProvider } from '../../../providers/swap-program/swap-program.provider';
import {
  OCSwapItem,
  OCSwapOption,
} from '../../../providers/swap-program/swap.type';
import { OCSwapItemDto } from '../../onchain-dto/oc-swap-item.dto';
import { OCSwapOptionDto } from '../../onchain-dto/oc-swap-option.dto';
import { OCSwapProposalDto } from '../../onchain-dto/oc-swap-proposal.dto';
import { isIdsMatched } from '../../onchain-dto/primitive.helper';
import { SwapItemType } from '../../entities/swap-item.entity';
import { TokenMetadataService } from './token-metadata.service';
import { SwapProposalStatus } from '../../entities/swap-proposal.entity';
import { DateTime } from 'luxon';
import { ChainId } from 'src/swap/entities/swap-platform-config.entity';

@Injectable()
export class SyncSwapProposalService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectRepository(SwapProposalModel)
    private readonly swapProposalRepo: Repository<SwapProposalModel>,
    private readonly swapProgramProvider: SwapProgramProvider,
    private readonly tokenMetadataService: TokenMetadataService,
  ) {}

  private async getSwapItem(
    ocItem: OCSwapItem,
    dbItem: SwapItemModel,
  ): Promise<SwapItemModel> {
    const item = new OCSwapItemDto(ocItem, dbItem);
    if (item.type === SwapItemType.NFT) {
      const { metadata } = await this.tokenMetadataService.getNftMetadata(
        item.contractAddress,
        true,
      );
      item.nftMetadata = metadata;
    }

    if (item.type === SwapItemType.CURRENCY) {
      const { metadata } = await this.tokenMetadataService.getCurrency(
        item.contractAddress,
        true,
      );
      item.nftMetadata = metadata;
    }

    return this.entityManager.create(SwapItemModel, item);
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

        const option = this.entityManager.create(
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

    // resync owner again
    proposal.ownerAddress = ocProposal.owner.toBase58();

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

    proposal.buildSearchText();

    await this.swapProposalRepo.save(proposal);
  }

  public async syncByAddress(
    ownerAddress: string,
  ): Promise<void> {
    const proposals = await this.swapProposalRepo.find({
      where: [
        { ownerAddress, chainId: ChainId.Solana },
        { fulfillBy: ownerAddress, chainId: ChainId.Solana },   
      ],
    });

    if (proposals.length === 0) {
      console.warn(
        `No proposals found for address: ${ownerAddress} on chain: ${ChainId.Solana}`,
      );
      return;
    }

    await Promise.all(
      proposals.map(async (proposal) => {
        try {
          await this.syncById(proposal.id);
          console.log(`Synced completed for: ${proposal.id}`);
        } catch (e) {
          console.error(`ERROR: Sync proposal failed, id: ${proposal.id}`, e);
        }
      }),
    );
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async syncAllJob() {
    const startedAt = DateTime.now();
    console.info(
      `==========Sync All Proposal Started@${startedAt.toISO()}==========`,
    );

    const proposals = await this.swapProposalRepo.find({
      where: {
        status: In([
          SwapProposalStatus.CREATED,
          SwapProposalStatus.DEPOSITED,
          SwapProposalStatus.FULFILLED,
          SwapProposalStatus.CANCELED,
        ]),
        updatedAt: Between(
          startedAt.minus({ weeks: 1 }).toJSDate(),
          startedAt.minus({ minutes: 5 }).toJSDate(),
        ),
      },
      select: { id: true },
    });

    for (const { id } of proposals) {
      try {
        await this.syncById(id);
        console.log(`Synced completed for: ${id}`);
      } catch (e) {
        console.error(`ERROR: Sync proposal failed, id: ${id}`, e);
      }
    }

    const endedAt = DateTime.now();
    const { seconds } = endedAt.diff(startedAt, 'seconds').toObject();
    console.info(
      `==========Sync All Proposal Ended@${endedAt.toISO()} Take:${seconds}s==========`,
    );
  }
}
