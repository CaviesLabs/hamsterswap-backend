import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
/**
 * @dev import deps
 */
import {
  PolicyLockModel,
  PolicyLockDocument,
} from '../../orm/model/policy-lock.model';
import { UserEntity } from '../../user/entities/user.entity';
import {
  LockType,
  PolicyLockException,
  PolicyReason,
} from '../entities/policy-lock.entity';

@Injectable()
export class BanPolicyService {
  constructor(
    @InjectModel(PolicyLockModel.name)
    private readonly policyLockDocument: Model<PolicyLockDocument>,
  ) {}

  /**
   * @dev find the longest lock that apply to that user by email, sub, wallet
   * with banned reason.
   * @param user the user to check
   */
  public async mustNotBanned(user: UserEntity) {
    const { email, sub, wallet } = user;
    const banned = await this.policyLockDocument.findOne(
      {
        target: {
          $in: [email, sub, wallet],
        },
        type: {
          $in: [LockType.EMAIL, LockType.USER_SUB, LockType.WALLET_ADDRESS],
        },
        reason: PolicyReason.BANNED,
      },
      undefined,
      { sort: { lockedUntil: -1 } },
    );
    if (banned) throw new PolicyLockException(banned);
  }
}
