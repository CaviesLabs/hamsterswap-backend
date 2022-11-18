import { Injectable } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * @dev Import deps
 */
import { EnabledIdpEntity } from '../../user/entities/enabled-idp.entity';
import { AvailableIdpResourceName } from '../../providers/idp/identity-provider.interface';
import { TimestampEntity } from '../extended.entity';

/**
 * @dev Define EnabledIdpModel
 */
@Injectable()
@Schema({ timestamps: false, autoIndex: true })
export class EnabledIdpModel implements EnabledIdpEntity {
  /**
   * @dev Unique string
   */
  @Prop({ type: String })
  identityId: string;

  @Prop({ type: String, enum: AvailableIdpResourceName })
  type: AvailableIdpResourceName;

  @Prop({ type: String })
  userId: string;
}

/**
 * @dev Trigger create schema.
 */
export const EnabledIdpSchema = SchemaFactory.createForClass(EnabledIdpModel);

/**
 * @dev Trigger create index.
 */
EnabledIdpSchema.index({ identityId: 1 }, { unique: true });
EnabledIdpSchema.index({ userId: 1, identityId: 1 });
EnabledIdpSchema.index({ userId: 1, type: 1 });
EnabledIdpSchema.index({ userId: 1, _id: 1 });
EnabledIdpSchema.index({ userId: 1 });

/**
 * @dev Define generic type for typescript reference.
 */
export type EnabledIdpDocument = EnabledIdpEntity & TimestampEntity & Document;
