import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ArrayType } from '../../api-docs/array-type.decorator';

import { SwapProposalStatus } from '../entities/swap-proposal.entity';

export class FindProposalDto {
  @IsString({ each: true })
  @IsOptional()
  @Type(() => String)
  @ArrayType()
  ownerAddresses?: string[];

  @IsEnum(SwapProposalStatus, { each: true })
  @IsOptional()
  @Type(() => String)
  @ArrayType()
  statuses?: SwapProposalStatus[];
}
