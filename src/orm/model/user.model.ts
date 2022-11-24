import { Column, Entity, OneToMany } from 'typeorm';
import { Role, UserEntity, UserGroup } from '../../user/entities/user.entity';
import { BaseModel } from '../base.model';
import { EnabledIdpModel } from './enabled-idp.model';

@Entity({
  name: 'user',
})
export class UserModel extends BaseModel implements UserEntity {
  @Column({ type: String })
  email?: string;

  @Column({ type: Boolean })
  emailVerified?: boolean;

  @Column({ type: Date })
  birthday?: Date;

  @Column({ type: String })
  displayName?: string;

  @Column({ type: String })
  avatar?: string;

  @Column({ enum: Role, type: String, array: true })
  roles: Role[];

  @Column({ enum: UserGroup, type: String, array: true })
  groups?: UserGroup[];

  @OneToMany(() => EnabledIdpModel, (enabledIdp) => enabledIdp.userId)
  enabledIdps: EnabledIdpModel[];
}
