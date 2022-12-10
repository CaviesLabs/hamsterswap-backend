import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ArrayType } from '../../api-docs/array-type.decorator';

import { SwapProposalStatus } from '../entities/swap-proposal.entity';

export class FindProposalDto {
  @IsString({ each: true })
  @IsOptional()
  @Type(() => String)
  @ArrayType()
  ownerAddresses?: string[];

  @IsBoolean()
  @IsOptional()
  countParticipation?: boolean;

  @IsEnum(SwapProposalStatus, { each: true })
  @IsOptional()
  @Type(() => String)
  @ArrayType()
  statuses?: SwapProposalStatus[];
}
