import { Injectable } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * @dev Import base entities.
 */
import {
  PreMatureAuthSessionEntity,
  GrantType,
  SessionType,
  PreMatureScope,
} from '../../auth/entities/auth-session.entity';
import { TimestampEntity } from '../extended.entity';

/**
 * @dev Define model.
 */
@Injectable()
@Schema({ timestamps: true, autoIndex: true })
export class AuthSessionModel implements PreMatureAuthSessionEntity {
  @Prop({ type: String })
  readonly actorId: string;

  @Prop({ type: String })
  readonly authorizedPartyId: string;

  @Prop({ type: String })
  readonly checksum: string;

  @Prop({ type: String, enum: GrantType, default: GrantType.Account })
  readonly grantType: GrantType;

  @Prop({ type: String, enum: SessionType, default: SessionType.Direct })
  readonly sessionType: SessionType;

  @Prop({ type: Date })
  readonly expiryDate: Date;

  @Prop({ type: [{ type: String, enum: PreMatureScope }] })
  scopes: PreMatureScope[];
}

/**
 * @dev Trigger create schema.
 */
export const AuthSessionSchema = SchemaFactory.createForClass(AuthSessionModel);

/**
 * @dev Trigger create index
 */
AuthSessionSchema.index({ authorizedParty: 1 });
AuthSessionSchema.index({ actorId: 1 });
AuthSessionSchema.index({ checksum: 1 }, { unique: true });

/**
 * @dev Declare document for typescript reference.
 */
export type AuthSessionDocument = PreMatureAuthSessionEntity &
  TimestampEntity &
  Document;
