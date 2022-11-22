/**
 * @dev Import logic deps
 */
import {
  ExtendedSessionEntity,
  SessionDistributionType,
} from '../../auth/entities/extended-session.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { EnabledIdpModel } from './enabled-idp.model';
import { BaseModel } from '../base.model';

/**
 * @dev Define the UserActivity model
 */
@Entity()
export class ExtendedSessionModel
  extends BaseModel
  implements ExtendedSessionEntity
{
  @Column({ type: String })
  userId: string;

  @Column({ type: String, array: true })
  userIpAddress: string[];

  @Column({ type: String, array: true })
  userAgent: string[];

  @Column({ type: Date })
  lastActiveTime: Date;

  @Column({ type: String, enum: SessionDistributionType })
  distributionType: SessionDistributionType;

  @Column({ type: String })
  sessionOrigin: string;

  @Column({ type: String })
  enabledIdpId: string;

  @ManyToOne(() => EnabledIdpModel, (enabledIdp) => enabledIdp.sessions, {
    lazy: true,
    onDelete: 'CASCADE',
  })
  enabledIdp: EnabledIdpModel;
}
