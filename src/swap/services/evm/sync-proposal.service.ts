import { InjectEntityManager } from '@nestjs/typeorm';
import { Between, EntityManager, In } from 'typeorm';
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
  ) {}

  public async syncById(proposalId: string) {
    const proposal = await this.entityManager.findOneBy<SwapProposalModel>(
      SwapProposalModel,
      { id: proposalId },
    );

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
      proposalId,
    );

    await this.entityManager.save(SwapProposalModel, onchainProposal);
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  public syncAllJobs() {
    return this.entityManager.transaction(async () => {
      const startedAt = DateTime.now();
      console.info(
        `==========Sync All EVM Proposals Started@${startedAt.toISO()}==========`,
      );

      const proposals = await this.entityManager.find(SwapProposalModel, {
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
          chainId: In([ChainId.Klaytn]),
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
        `==========Sync All EVM Proposals Ended@${endedAt.toISO()} Take:${seconds}s==========`,
      );
    });
  }
}
