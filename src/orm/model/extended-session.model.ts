import { Column, Entity, ManyToOne } from 'typeorm';
/**
 * @dev Import logic deps
 */
import {
  ExtendedSessionEntity,
  SessionDistributionType,
} from '../../auth/entities/extended-session.entity';
import { EnabledIdpModel } from './enabled-idp.model';
import { BaseModel } from '../base.model';

/**
 * @dev Define the UserActivity model
 */
@Entity({
  name: 'extended_session',
})
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

  @Column({ type: String, foreignKeyConstraintName: 'enabledIdp_id_fk' })
  enabledIdpId: string;

  @ManyToOne(() => EnabledIdpModel, (enabledIdp) => enabledIdp.sessions, {
    lazy: true,
    cascade: true,
  })
  enabledIdp: EnabledIdpModel;
}
