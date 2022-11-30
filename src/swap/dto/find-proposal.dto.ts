import { IsEnum, IsOptional, IsString } from 'class-validator';

import { SwapProposalStatus } from '../entities/swap-proposal.entity';

export class FindProposalDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString({ each: true })
  @IsOptional()
  ownerAddresses?: string[];

  @IsEnum(SwapProposalStatus, { each: true })
  @IsOptional()
  statuses?: SwapProposalStatus[];
}