import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CommonQueryDto } from '../../api-docs/dto/common-query.dto';
import { SwapProposalModel } from '../../orm/model/swap-proposal.model';
import { CreateSwapProposalDto } from '../dto/create-proposal.dto';
import { FindProposalDto } from '../dto/find-proposal.dto';
import { UpdateSwapProposalAdditionsDto } from '../dto/update-proposal.dto';
import { SwapProposalEntity } from '../entities/swap-proposal.entity';
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

  @Post()
  createEmpty(
    @Body() body: CreateSwapProposalDto,
  ): Promise<SwapProposalEntity> {
    return this.proposalService.create(body);
  }

  @Patch('/:proposalId/additions')
  updateAdditions(
    @Param('proposalId') proposalId: string,
    @Body()
    body: UpdateSwapProposalAdditionsDto,
  ): Promise<SwapProposalEntity> {
    return this.proposalService.updateAdditional(proposalId, body);
  }
}
