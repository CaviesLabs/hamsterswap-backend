/**
 * @dev Import deps
 */
import { EnabledIdpEntity } from '../../user/entities/enabled-idp.entity';
import { AvailableIdpResourceName } from '../../providers/idp/identity-provider.interface';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseModel } from '../base.model';
import { ExtendedSessionModel } from './extended-session.model';

/**
 * @dev Define EnabledIdpModel
 */
@Entity()
@Index(['userId', 'identityId'])
@Index(['userId', 'type'])
@Index(['userId', 'id'])
export class EnabledIdpModel extends BaseModel implements EnabledIdpEntity {
  /**
   * @dev Unique string
   */
  @Column({ type: String })
  @Index({ unique: true })
  identityId: string;

  @Column({ type: String, enum: AvailableIdpResourceName })
  type: AvailableIdpResourceName;

  @Column({ type: String })
  @Index()
  userId: string;

  @OneToMany(() => ExtendedSessionModel, (session) => session.enabledIdp, {
    lazy: true,
  })
  sessions: ExtendedSessionModel[];
}
