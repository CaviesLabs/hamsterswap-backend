import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiProperty, PickType } from '@nestjs/swagger';

export enum LockType {
  EMAIL = 'email',
  USER_SUB = 'user.sub',
  WALLET_ADDRESS = 'wallet.address',
}

export enum PolicyReason {
  INVALID_OTP = 'LOCK_REASON::INVALID_OTP',
  RESEND_OTP_LIMIT = 'LOCK_REASON::RESEND_OTP_LIMIT',
  RESEND_OTP_RATE = 'LOCK_REASON::RESEND_OTP_RATE',
  BANNED = 'LOCK_REASON::BANNED',
}

/**
 * @dev define lock status and counter to lock of a target
 */
export class PolicyLockEntity {
  /**
   * @dev target for lock by, e.g. username, email, wallet,...
   */
  @ApiProperty()
  target: string;

  /**
   * @dev target type, for categorize target
   */
  @ApiProperty()
  type: LockType;

  /**
   * @dev failed counter
   */
  @ApiProperty()
  counter: number;

  /**
   * @dev lock until time
   */
  @ApiProperty()
  lockedUntil: Date | null;

  /**
   * @dev lock reason
   */
  @ApiProperty()
  reason: PolicyReason;
}

export class LockPrimaryKey extends PickType(PolicyLockEntity, [
  'target',
  'type',
  'reason',
]) {}

export class PolicyLockException extends HttpException {
  constructor({ counter, lockedUntil, reason }: PolicyLockEntity) {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many requests',
        error: {
          counter,
          lockedUntil,
          reason,
        },
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
