import { ApiProperty } from '@nestjs/swagger';
import { PolicyLockEntity } from './policy-lock.entity';

export class LockStatusEntity extends PolicyLockEntity {
  /**
   * @dev userId belong to this lock if exists
   */
  @ApiProperty()
  belongUserId?: string;
}
