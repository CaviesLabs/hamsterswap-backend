import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Between, EntityManager, In, Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DateTime } from 'luxon';
import { Cron, CronExpression } from '@nestjs/schedule';

import { EvmParser } from './evm.parser';
import { SwapProposalModel } from '../../../orm/model/swap-proposal.model';
import { ChainId } from '../../entities/swap-platform-config.entity';
import { SwapProposalStatus } from '../../entities/swap-proposal.entity';

export class EvmSyncProposalService {
  constructor(
    private readonly evmParser: EvmParser,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectRepository(SwapProposalModel)
    private readonly swapProposalRepo: Repository<SwapProposalModel>,
  ) {}

  public async syncById(proposalId: string) {
    const proposal = await this.swapProposalRepo.findOne({
      where: { id: proposalId },
      relations: { offerItems: true, swapOptions: { items: true } },
    });

    if (!proposal) {
      throw new NotFoundException(`PROPOSAL_NOT_FOUND: ${proposalId}`);
    }

    if (proposal.chainId === ChainId.Solana) {
      throw new BadRequestException(
        `UNSUPPORTED_CHAIN_ID: ${proposal.chainId}`,
      );
    }

    const onchainProposal = await this.evmParser.fetchProposalFromOnChainData(
      proposal.chainId,
      proposal,
    );

    await this.entityManager.save(SwapProposalModel, onchainProposal, {});
  }

  public async syncByAddress(ownerAddress: string, chainId: ChainId) {
    if (chainId === ChainId.Solana) {
      throw new BadRequestException('NOT_SUPPORTED_CHAIN_ID: Solana');
    }

    const proposals = await this.entityManager.find(SwapProposalModel, {
      where: [
        {
          ownerAddress: ownerAddress,
          chainId: In([ChainId.Klaytn]),
        },
        {
          fulfillBy: ownerAddress,
          chainId: In([ChainId.Klaytn]),
        },
      ],
      relations: { offerItems: true, swapOptions: { items: true } },
    });

    const onChainProposals =
      await this.evmParser.fetchMultipleProposalsFromOnChainData(
        chainId,
        proposals,
      );

    await Promise.all(
      onChainProposals.map(async (proposal) => {
        try {
          await this.entityManager.save(SwapProposalModel, proposal, {});
          console.log(`Synced completed for: ${proposal.id}`);
        } catch (e) {
          console.log('ERROR: Sync proposal failed', e);
        }
      }),
    );
  }

  @Cron(CronExpression.EVERY_MINUTE)
  public syncAllJobs() {
    // return this.entityManager.transaction(async () => {
    //   const startedAt = DateTime.now();
    //   console.info(
    //     `==========Sync All EVM Proposals Started@${startedAt.toISO()}==========`,
    //   );

    //   const proposals = await this.entityManager.find(SwapProposalModel, {
    //     where: {
    //       status: In([
    //         SwapProposalStatus.CREATED,
    //         SwapProposalStatus.DEPOSITED,
    //         SwapProposalStatus.FULFILLED,
    //         SwapProposalStatus.CANCELED,
    //       ]),
    //       updatedAt: Between(
    //         startedAt.minus({ weeks: 1 }).toJSDate(),
    //         startedAt.minus({ minutes: 5 }).toJSDate(),
    //       ),
    //       chainId: In([ChainId.Klaytn]),
    //     },
    //     relations: { offerItems: true, swapOptions: { items: true } },
    //   });

    //   const onChainProposals =
    //     await this.evmParser.fetchMultipleProposalsFromOnChainData(
    //       ChainId.Klaytn,
    //       proposals,
    //     );

    //   await Promise.all(
    //     onChainProposals.map(async (proposal) => {
    //       try {
    //         await this.entityManager.save(SwapProposalModel, proposal, {});
    //         console.log(`Synced completed for: ${proposal.id}`);
    //       } catch (e) {
    //         console.log('ERROR: Sync proposal failed', e);
    //       }
    //     }),
    //   );

    //   const endedAt = DateTime.now();
    //   const { seconds } = endedAt.diff(startedAt, 'seconds').toObject();
    //   console.info(
    //     `==========Sync All EVM Proposals Ended@${endedAt.toISO()} Take:${seconds}s==========`,
    //   );
    // });
  }
}
