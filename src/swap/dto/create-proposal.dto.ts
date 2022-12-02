import { PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

import { SwapProposalEntity } from '../entities/swap-proposal.entity';

// Type hack to implement a PickType so Enity changes => Dto affected
class _CreateSwapProposalDto extends PickType(SwapProposalEntity, [
  'expiredAt',
  'note',
]) {}

export class CreateSwapProposalDto implements _CreateSwapProposalDto {
  @IsDate()
  @Type(() => Date)
  expiredAt: Date;

  @IsString()
  @IsOptional()
  note?: string;
}
