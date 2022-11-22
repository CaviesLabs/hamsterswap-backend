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
@Entity()
export class AuthSessionModel extends BaseModel implements AuthSessionEntity {
  @Column({ type: String })
  @Index()
  readonly actorId: string;

  @Column({ type: String })
  @Index()
  readonly authorizedPartyId: string;

  @Column({ type: String })
  @Index({ unique: true })
  readonly checksum: string;

  @Column({ type: String, enum: GrantType, default: GrantType.Account })
  readonly grantType: GrantType;

  @Column({ type: String, enum: SessionType, default: SessionType.Direct })
  readonly sessionType: SessionType;

  @Column({ type: Date })
  readonly expiryDate: Date;

  @Column({ enum: AuthScope, type: String, array: true })
  scopes: AuthScope[];
}
