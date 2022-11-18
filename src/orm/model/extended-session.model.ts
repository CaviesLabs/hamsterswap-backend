import { Injectable } from '@nestjs/common';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 * @dev Import logic deps
 */
import {
  ExtendedSessionEntity,
  SessionDistributionType,
} from '../../auth/entities/extended-session.entity';
import { EnabledIdpModel } from './enabled-idp.model';

/**
 * @dev Define the UserActivity model
 */
@Injectable()
@Schema({ timestamps: false, autoIndex: true })
export class ExtendedSessionModel implements ExtendedSessionEntity {
  @Prop({ type: String })
  userId: string;

  @Prop([{ type: String }])
  userIpAddress: string[];

  @Prop([{ type: String }])
  userAgent: string[];

  @Prop({ type: Date })
  lastActiveTime: Date;

  @Prop({ type: String, enum: SessionDistributionType })
  distributionType: SessionDistributionType;

  @Prop({ type: String })
  sessionOrigin: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: () => EnabledIdpModel })
  enabledIdpId: string;
}

/**
 * @dev Trigger create schema.
 */
export const ExtendedSessionSchema =
  SchemaFactory.createForClass(ExtendedSessionModel);

/**
 * @dev Create indexes.
 */
ExtendedSessionSchema.index({ sessionOrigin: 1 }, { unique: true });
ExtendedSessionSchema.index({ sessionOrigin: 1, distributionType: 1 });
ExtendedSessionSchema.index({ lastActiveTime: -1 });
ExtendedSessionSchema.index({ userId: 1 });
ExtendedSessionSchema.index({ userId: 1, enabledIdpId: 1 });

/**
 * @dev Define generic type for typescript reference.
 */
export type ExtendedSessionDocument = ExtendedSessionModel & Document;
