import { IsEmail, IsEnum } from 'class-validator';
import { LockType } from '../entities/policy-lock.entity';

export class GetLockStatusDto {
  @IsEmail()
  target: string;

  @IsEnum(LockType)
  type: LockType;
}
