import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Injectable } from '@nestjs/common';

/**
 * @dev Import base Auth entity.
 */
import { AuthChallengeEntity } from '../../auth/entities/auth-challenge.entity';
import { TimestampEntity } from '../extended.entity';

/**
 * @dev Define the AuthChallengeModel
 */
@Injectable()
@Schema({ timestamps: true, autoIndex: true })
export class AuthChallengeModel implements AuthChallengeEntity {
  @Prop({ type: String })
  target: string;

  @Prop({ type: String })
  memo: string;

  @Prop({ type: Date })
  expiryDate: Date;

  @Prop({ type: Boolean })
  isResolved: boolean;

  @Prop({ type: Number })
  durationDelta: number;
}

/**
 * @dev Trigger create schema.
 */
export const AuthChallengeSchema =
  SchemaFactory.createForClass(AuthChallengeModel);

/**
 * @dev Trigger create index.
 */
AuthChallengeSchema.index({ target: 1, createdAt: -1 });

/**
 * @dev Define generic type for typescript reference.
 */
export type AuthChallengeDocument = AuthChallengeModel &
  TimestampEntity &
  Document;
