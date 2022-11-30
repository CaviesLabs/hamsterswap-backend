import { PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { SwapProposalEntity } from '../entities/swap-proposal.entity';

class _UpdateSwapProposalAdditionsDto extends PickType(SwapProposalEntity, [
  'note',
]) {}

export class UpdateSwapProposalAdditionsDto
  implements _UpdateSwapProposalAdditionsDto
{
  @IsOptional()
  @IsString()
  note?: string;
}
