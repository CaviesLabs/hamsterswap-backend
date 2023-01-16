import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CommonQueryDto } from '../../api-docs/dto/common-query.dto';
import { CurrentSession } from '../../auth/decorators/current-session.decorator';
import { JwtAuthSession } from '../../auth/strategies/premature-auth.strategy';
import { IdpResourceService } from '../../user/services/idp-resource.service';
import { CreateSwapProposalDto } from '../dto/create-proposal.dto';
import { FindProposalDto } from '../dto/find-proposal.dto';
import { UpdateSwapProposalAdditionsDto } from '../dto/update-proposal.dto';
import { SwapProposalEntity } from '../entities/swap-proposal.entity';
import { ProposalService } from '../services/proposal.service';
import { SyncSwapProposalService } from '../services/sync-proposal.service';

@Controller('proposal')
@ApiTags('swap')
export class ProposalController {
  constructor(
    private readonly proposalService: ProposalService,
    private readonly syncSwapProposalService: SyncSwapProposalService,
    private readonly idpResourceService: IdpResourceService,
  ) {}

  @Get('')
  @UseInterceptors(ClassSerializerInterceptor)
  async find(
    @Query() { ownerAddresses, statuses, countParticipation }: FindProposalDto,
    @Query() { limit, offset, search }: CommonQueryDto,
  ): Promise<SwapProposalEntity[]> {
    const proposals = await this.proposalService.find({
      ownerAddresses,
      statuses,
      limit,
      offset,
      countParticipation,
      search,
    });

    return Promise.all(
      proposals.map(async (pro) => {
        if (!!pro.fulfillBy) {
          (pro as any).fulfillByUserId = (
            await this.idpResourceService.findUserIdpByAddress(pro.fulfillBy)
          )[0]?.userId;
        }
        return pro;
      }),
    );
  }

  @Get('/:proposalId')
  @UseInterceptors(ClassSerializerInterceptor)
  getProposal(@Param('proposalId') proposalId: string) {
    return this.proposalService.findById(proposalId);
  }

  @Post()
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'))
  async createEmpty(
    @CurrentSession() { user }: JwtAuthSession,
    @Body() body: CreateSwapProposalDto,
  ): Promise<SwapProposalEntity> {
    const [idp] = await this.idpResourceService.listUserIdp(user.id);
    return this.proposalService.create({
      ...body,
      ownerId: user.id,
      ownerAddress: idp.identityId,
    });
  }

  @Patch('/:proposalId/additions')
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'))
  updateAdditions(
    @Param('proposalId') proposalId: string,
    @Body()
    body: UpdateSwapProposalAdditionsDto,
  ): Promise<SwapProposalEntity> {
    return this.proposalService.updateAdditional(proposalId, body);
  }

  @Patch('/:proposalId/sync')
  syncProposal(@Param('proposalId') proposalId: string) {
    return this.syncSwapProposalService.syncById(proposalId);
  }
}
