export enum Role {
  User = 'ROLE::USER',
  Admin = 'ROLE::ADMIN',
}

/**
 * @dev UserRole for hamsterbox account.
 */
export enum UserGroup {
  Gamer = '/gamer',
  Partner = '/partner',
}

/**
 * @dev Keycloak user info.
 */
export class UserEntity {
  id: string;

  email?: string;

  emailVerified?: boolean;

  birthday?: Date;

  displayName?: string;

  avatar?: string;

  roles: Role[];

  groups?: UserGroup[];
}
