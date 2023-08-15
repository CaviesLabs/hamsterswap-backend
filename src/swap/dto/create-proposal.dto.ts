import { PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';

import { SwapProposalEntity } from '../entities/swap-proposal.entity';
import { ChainId } from '../entities/swap-platform-config.entity';

// Type hack to implement a PickType so Enity changes => Dto affected
class _CreateSwapProposalDto extends PickType(SwapProposalEntity, [
  'expiredAt',
  'note',
]) {
  chainId?: ChainId;
}

export class CreateSwapProposalDto implements _CreateSwapProposalDto {
  @IsDate()
  @Type(() => Date)
  expiredAt: Date;

  @IsEnum(ChainId)
  @IsOptional()
  chainId?: ChainId;

  @IsString()
  @IsOptional()
  note?: string;
}
