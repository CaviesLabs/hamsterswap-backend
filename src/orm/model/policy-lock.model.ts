import { Injectable } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 * @dev Import base entities.
 */
import {
  PolicyLockEntity,
  LockType,
  PolicyReason,
} from '../../account-policy/entities/policy-lock.entity';
import { TimestampEntity } from '../extended.entity';

/**
 * @dev Define the AccountLockModel
 */
@Injectable()
@Schema({ timestamps: true, autoIndex: true })
export class PolicyLockModel implements PolicyLockEntity {
  @Prop({ type: String })
  target: string;

  @Prop({ type: String, enum: LockType })
  type: LockType;

  @Prop({ type: Number })
  counter: number;

  @Prop({ type: Date, default: null })
  lockedUntil: Date | null;

  @Prop({ type: String, enum: PolicyReason })
  reason: PolicyReason;
}

/**
 * @dev Trigger create schema.
 */
export const PolicyLockSchema = SchemaFactory.createForClass(PolicyLockModel);

/**
 * @dev Trigger create index.
 * `target` + `type` + `reason` combo should unique
 */
PolicyLockSchema.index({ target: 1, type: 1, reason: 1 }, { unique: true });
PolicyLockSchema.index({ target: 1, type: 1 });
PolicyLockSchema.index({ lockedUntil: -1 });
/**
 * @dev Define generic type for typescript reference.
 */
export type PolicyLockDocument = PolicyLockModel & TimestampEntity & Document;
