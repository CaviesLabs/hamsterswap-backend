import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { DateTime, Duration } from 'luxon';
import { Model } from 'mongoose';
/**
 * @dev import deps
 */
import {
  PolicyLockDocument,
  PolicyLockModel,
} from '../../orm/model/policy-lock.model';
import { KeycloakAdminProvider } from '../../providers/federated-users/keycloak-admin.provider';
import { LockStatusEntity } from '../entities/email-status.entity';
import {
  LockPrimaryKey,
  LockType,
  PolicyLockEntity,
  PolicyLockException,
} from '../entities/policy-lock.entity';

@Injectable()
export class PolicyLockService {
  constructor(
    private readonly keycloakAdminProvider: KeycloakAdminProvider,
    @InjectModel(PolicyLockModel.name)
    private readonly policyLockDocument: Model<PolicyLockDocument>,
  ) {}

  /**
   * @dev Increase the counter and set lockedUntil if exceed the limit
   * @param lockPK the lock entity
   * @param limit the limit of lock
   * @param duration the locked duration to add from current
   */
  public async increaseCounter(
    lockPK: LockPrimaryKey,
    limit: number,
    duration: Duration,
  ) {
    /**
     * @dev increase counter first
     */
    const increasedLock = await this.policyLockDocument.findOneAndUpdate(
      lockPK,
      {
        $inc: {
          counter: 1,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );
    /**
     * @dev update lockedUntil and reset counter
     */
    if (increasedLock.counter >= limit) {
      await this.policyLockDocument.updateOne(lockPK, {
        $set: {
          lockedUntil: DateTime.now().plus(duration).toJSDate(),
          counter: 0,
        },
      });
    }
  }

  /**
   * @dev Instant create a lock or set lockedUntil if existed
   * @param lockPK the lock entity
   * @param duration the locked duration to add from current
   */
  public async instantLock(lockPK: LockPrimaryKey, duration: Duration) {
    await this.policyLockDocument.updateOne(
      lockPK,
      {
        $set: {
          lockedUntil: DateTime.now().plus(duration).toJSDate(),
        },
        $setOnInsert: {
          counter: 0,
        },
      },
      {
        upsert: true,
      },
    );
  }

  /**
   * @dev throw a PolicyLockException if target is locked. Otherwise, return
   * empty or current lock.
   * @param primaryKey keys for a lock
   * @param limit the limit of the lock
   * @returns PolicyLockEntity
   */
  public async mustNotLocked(
    primaryKey: LockPrimaryKey,
    limit = 0,
  ): Promise<PolicyLockEntity> {
    const lock = await this.policyLockDocument.findOne(primaryKey);
    /**
     * @dev lock not found return empty unlocked one
     */
    if (!lock)
      return {
        ...primaryKey,
        counter: 0,
        lockedUntil: null,
      };

    const now = new Date();
    /**
     * @dev throw exception if lock is not open or the limit is exceed
     */
    if ((lock.lockedUntil && lock.lockedUntil > now) || lock.counter >= limit)
      throw new PolicyLockException(lock);
    return lock;
  }

  /**
   * @dev getEmailStatus
   * - collect policy lock related if exists
   * - collect user owned the email if exists
   * @param target the target to check
   * @param type the target type
   * @param limit pagination query
   * @param skip pagination query
   * @returns the list of locks
   */
  public async getStatus(
    target: string,
    type: LockType,
    limit: number,
    skip: number,
  ): Promise<LockStatusEntity[]> {
    /**
     * @dev get locks by target and type
     */
    const locks = await this.policyLockDocument.find(
      { target, type },
      undefined,
      { limit, skip },
    );

    /**
     * @dev map belongUserId and return
     */
    return locks.map((lock) =>
      plainToInstance(LockStatusEntity, lock.toObject()),
    );
  }
}
