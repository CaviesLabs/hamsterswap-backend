import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ArrayType } from '../../api-docs/array-type.decorator';

import { ComputedSwapProposalStatus } from '../entities/swap-proposal.entity';
import { ChainId } from '../entities/swap-platform-config.entity';

export class FindProposalDto {
  @IsString({ each: true })
  @IsOptional()
  @Type(() => String)
  @ArrayType()
  ownerAddresses?: string[];

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  countParticipation?: boolean;

  @IsEnum(ComputedSwapProposalStatus, { each: true })
  @IsOptional()
  @Type(() => String)
  @ArrayType()
  statuses?: ComputedSwapProposalStatus[];

  @IsEnum(ChainId)
  @IsOptional()
  chainId?: ChainId;
}
