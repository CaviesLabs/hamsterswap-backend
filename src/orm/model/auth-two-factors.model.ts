import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Injectable } from '@nestjs/common';

/**
 * @dev Import base entities.
 */
import { TimestampEntity } from '../extended.entity';
import { TwoFactorsEntity } from '../../user/entities/two-factors.entity';

/**
 * @dev Define the TwoFactors
 */
@Injectable()
@Schema({ timestamps: true, autoIndex: true })
export class TwoFactorsModel implements TwoFactorsEntity {
  @Prop({ type: String })
  userId: string;

  @Prop({ type: String })
  hash: string;

  @Prop({ type: Number })
  confirmedAt: number | null;

  @Prop({ type: Number })
  confirmedExpiryDate: number;

  @Prop({ type: Number })
  step: number;
}

/**
 * @dev Trigger create schema.
 */
export const TwoFactorsSchema = SchemaFactory.createForClass(TwoFactorsModel);

/**
 * @dev Trigger create index.
 */
TwoFactorsSchema.index({ userId: 1 }, { unique: true });
TwoFactorsSchema.index({ hash: 1 }, { unique: true });

/**
 * @dev Define generic type for typescript reference.
 */
export type TwoFactorsDocument = TwoFactorsEntity & TimestampEntity & Document;
