import { Injectable } from '@nestjs/common';
import { Duration } from 'luxon';
/**
 * @dev import deps
 */
import {
  LockType,
  PolicyLockEntity,
  PolicyReason,
} from '../entities/policy-lock.entity';
import { PolicyLockService } from './policy-lock.service';

@Injectable()
export class OtpPolicyService {
  constructor(private readonly policyLockService: PolicyLockService) {}

  /**
   * @dev check if locked then continue lock by `duration` added from current
   * @param email target email
   * @param duration duration of resend-able
   */
  public async mustNotOverResendEmailOtpRate(
    email: string,
    duration = Duration.fromObject({ seconds: 60 }),
  ) {
    const lockPK = {
      target: email,
      type: LockType.EMAIL,
      reason: PolicyReason.RESEND_OTP_RATE,
    };
    await this.policyLockService.mustNotLocked(lockPK);
    await this.policyLockService.instantLock(lockPK, duration);
  }

  /**
   * @dev check the email OTP limit lock
   * @param email target email
   * @param limit limit of tries
   * @returns lock entity
   */
  public mustNotOverResendEmailOtpLimit(
    email: string,
    limit = 5,
  ): Promise<PolicyLockEntity> {
    return this.policyLockService.mustNotLocked(
      {
        target: email,
        type: LockType.EMAIL,
        reason: PolicyReason.RESEND_OTP_LIMIT,
      },
      limit,
    );
  }

  /**
   * @dev count the resend email OTP tries
   * @param email target email
   * @param limit limit of tries
   * @param duration lock duration of added from current
   */
  public countResendEmailOtp(
    email: string,
    limit = 5,
    duration = Duration.fromObject({ hours: 1 }),
  ) {
    return this.policyLockService.increaseCounter(
      {
        target: email,
        type: LockType.EMAIL,
        reason: PolicyReason.RESEND_OTP_LIMIT,
      },
      limit,
      duration,
    );
  }

  /**
   * @dev check the email OTP limit lock
   * @param email target email
   * @param limit limit of tries
   * @returns lock entity
   */
  public mustNotOverInvalidEmailOtpLimit(
    email: string,
    limit = 5,
  ): Promise<PolicyLockEntity> {
    return this.policyLockService.mustNotLocked(
      {
        target: email,
        type: LockType.EMAIL,
        reason: PolicyReason.INVALID_OTP,
      },
      limit,
    );
  }

  /**
   * @dev count the invalid email OTP tries
   * @param email target email
   * @param limit limit of tries
   * @param duration lock duration of added from current
   */
  public countInvalidEmailOtp(
    email: string,
    limit = 5,
    duration = Duration.fromObject({ hours: 1 }),
  ) {
    return this.policyLockService.increaseCounter(
      {
        target: email,
        type: LockType.EMAIL,
        reason: PolicyReason.INVALID_OTP,
      },
      limit,
      duration,
    );
  }
}
