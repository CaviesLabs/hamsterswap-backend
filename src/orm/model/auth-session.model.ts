import { Column, Entity, Index } from 'typeorm';

/**
 * @dev Import base entities.
 */
import {
  AuthSessionEntity,
  GrantType,
  SessionType,
  AuthScope,
} from '../../auth/entities/auth-session.entity';
import { BaseModel } from '../base.model';

/**
 * @dev Define model.
 */
@Entity({
  name: 'auth_session',
})
export class AuthSessionModel extends BaseModel implements AuthSessionEntity {
  @Column({ type: String })
  @Index('actorId_idx')
  readonly actorId: string;

  @Column({ type: String })
  @Index('authorizedPartyId_idx')
  readonly authorizedPartyId: string;

  @Column({ type: String })
  @Index('checksum_uidx', { unique: true })
  readonly checksum: string;

  @Column({ type: String, enum: GrantType, default: GrantType.Account })
  readonly grantType: GrantType;

  @Column({ type: String, enum: SessionType, default: SessionType.Direct })
  readonly sessionType: SessionType;

  @Column({ type: 'timestamptz' })
  readonly expiryDate: Date;

  @Column({ enum: AuthScope, type: String, array: true })
  scopes: AuthScope[];
}
