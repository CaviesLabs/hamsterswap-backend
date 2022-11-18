/**
 * @dev Password regex. Please see reference: https://stackoverflow.com/a/21456918
 */
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,24}$/;

export const PASSWORD_EXPLAIN = `Password must have the following rules:
- 8-24 characters in length
- MUST have at least one UPPERCASE character.
- MUST have at least one LOWERCASE character.
- MUST have at least one number.
- MUST have at least one Special (Non-Alphanumeric) character (eg. ! @ # $ % ^ & * )`;

export const USERNAME_REGEX = /^[A-Za-z0-9_-]{5,14}$/;

export const USERNAME_EXPLAIN =
  'Only allow 5-14 characters of letters, numbers, dash, and underscore';

/**
 * @dev UserRole for hamsterbox account.
 */
export enum UserGroup {
  Gamer = '/gamer',
  Partner = '/partner',
}

/**
 * @dev User attributes.
 */
export class UserAttributes {
  avatar?: string;
  wallet?: string;
  nickname?: string;
  website?: string;
  locale?: string;
  birthdate?: string;
  middle_name?: string;
}

/**
 * @dev Keycloak user info.
 */
export class UserEntity {
  /**
   * @dev Email attribute is retrieved with `email` scope.
   */
  email: string;

  /**
   * @dev Profile attributes are retrieved with `profile` scope.
   */
  sub: string;
  email_verified: boolean;
  birthdate?: string;
  name?: string;
  family_name?: string;
  middle_name?: string;
  given_name?: string;
  nickname?: string;
  website?: string;
  locale?: string;
  avatar?: string;

  /**
   * @dev Wallet attribute is retrieved with `wallet` scope.
   */
  wallet?: string;

  /**
   * @dev Group attribute is retrieved with `group` scope.
   */
  group?: UserGroup[];
}
