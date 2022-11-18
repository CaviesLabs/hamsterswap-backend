import { Injectable } from '@nestjs/common';
import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
  EventType,
  TrailContextEntity,
  TrailEntity,
} from '../../audit/entities/trail.entity';
import { TimestampEntity } from '../extended.entity';
import { UserGroup } from '../../user/entities/user.entity';

/**
 * @dev Define the TrailContextModel
 */
export class TrailContextModel implements TrailContextEntity {
  @Prop({ type: String })
  contextId: string;

  userGroup?: UserGroup[];
  @Prop({ type: String })
  eventSource: string;

  @Prop({ type: Date })
  eventTime: Date;

  @Prop({ type: String })
  apiVersion: string;

  @Prop({ type: String })
  apiPath: string;

  @Prop([{ type: String }])
  tags: string[];

  @Prop({ type: String })
  userIpAddress: string;

  @Prop({ type: String })
  userAgent: string;

  @Prop({ type: Object })
  serviceEventDetails?: object;
}

/**
 * @dev Define the TrailModel
 */
@Injectable()
@Schema({ timestamps: true, autoIndex: true })
export class TrailModel implements TrailEntity {
  @Prop({ type: TrailContextModel })
  context: TrailContextModel;

  @Prop({ type: String })
  actorId: string;

  @Prop({ type: String })
  eventName: string;

  @Prop({ type: String })
  eventType: EventType;

  @Prop({ type: String })
  errorCode?: string;

  @Prop({ type: String })
  errorMessage?: string;

  @Prop({ type: Object })
  requestParameters?: object;

  @Prop({ type: Object })
  responseElements?: object;

  @Prop({ type: Object })
  additionalEventData?: any;

  @Prop({ type: String })
  requestId?: string;

  @Prop({ type: String })
  recipientAccountId?: string;
}

/**
 * @dev Trigger create schema.
 */
export const TrailSchema = SchemaFactory.createForClass(TrailModel);

/**
 * @dev Create indexes.
 */
TrailSchema.index({ actorId: 1, createdAt: 1 });
TrailSchema.index({ actorId: 1, createdAt: 1, eventType: 1, errorCode: 1 });

/**
 * @dev Define generic type for typescript reference.
 */
export type TrailDocument = TrailModel & TimestampEntity & Document;
