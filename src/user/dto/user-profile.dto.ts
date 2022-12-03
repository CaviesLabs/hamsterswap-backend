import { PickType } from '@nestjs/swagger';
import { UserEntity } from '../entities/user.entity';

export class UserProfileDto extends UserEntity {
  walletAddress: string;
}

export class UserPublicProfileDto extends PickType(UserEntity, [
  'id',
  'avatar',
  'telegram',
  'twitter',
]) {
  walletAddress: string;
}
