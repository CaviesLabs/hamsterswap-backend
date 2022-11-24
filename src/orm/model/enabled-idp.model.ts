/**
 * @dev Import deps
 */
import { EnabledIdpEntity } from '../../user/entities/enabled-idp.entity';
import { AvailableIdpResourceName } from '../../providers/idp/identity-provider.interface';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { BaseModel } from '../base.model';
import { ExtendedSessionModel } from './extended-session.model';
import { UserModel } from './user.model';

/**
 * @dev Define EnabledIdpModel
 */
@Entity({
  name: 'enabled_idp',
})
@Index('userId_identityId_idx', ['userId', 'identityId'])
@Index('userId_type_idx', ['userId', 'type'])
@Index('userId_id_idx', ['userId', 'id'])
export class EnabledIdpModel extends BaseModel implements EnabledIdpEntity {
  /**
   * @dev Unique string
   */
  @Column({ type: String })
  @Index('identityId_uidx', { unique: true })
  identityId: string;

  @Column({ type: String, enum: AvailableIdpResourceName })
  type: AvailableIdpResourceName;

  @Column({ type: String })
  @Index('userId_idx')
  userId: string;

  @ManyToOne(() => UserModel, { cascade: true })
  user: UserModel;

  @OneToMany(() => ExtendedSessionModel, (session) => session.enabledIdp, {
    lazy: true,
  })
  sessions: ExtendedSessionModel[];
}
