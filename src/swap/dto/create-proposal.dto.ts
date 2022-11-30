import { PickType } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString } from 'class-validator';

import { SwapProposalEntity } from '../entities/swap-proposal.entity';

// Type hack to implement a PickType so Enity changes => Dto affected
class _CreateSwapProposalDto extends PickType(SwapProposalEntity, [
  'ownerAddress',
  'expireAt',
  'note',
]) {}

export class CreateSwapProposalDto implements _CreateSwapProposalDto {
  @IsString()
  ownerAddress: string;

  @IsDate()
  expireAt: Date;

  @IsString()
  @IsOptional()
  note?: string;
}
