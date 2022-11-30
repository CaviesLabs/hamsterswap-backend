import { Controller, Get, Param, Query } from '@nestjs/common';

import { CommonQueryDto } from '../../api-docs/dto/common-query.dto';
import { SwapProposalModel } from '../../orm/model/swap-proposal.model';
import { FindProposalDto } from '../dto/find-proposal.dto';
import { ProposalService } from '../services/proposal.service';

@Controller('proposal')
export class ProposalController {
  constructor(private readonly proposalService: ProposalService) {}
  @Get('/:proposalId')
  getProposal(@Param('proposalId') proposalId: string) {
    return this.proposalService.findById(proposalId);
  }

  @Get()
  find(
    @Query() findProposalDto: FindProposalDto,
    @Query() commonQueryDto: CommonQueryDto,
  ): Promise<SwapProposalModel[]> {
    return this.proposalService.find({ ...findProposalDto, ...commonQueryDto });
  }
}