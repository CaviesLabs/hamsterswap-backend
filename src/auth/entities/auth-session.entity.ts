/**
 * @dev Declare Grant Type
 */
export enum GrantType {
  /**
   * @dev Declare that the session was issued for a service client.
   */
  ServiceClient = 'GRANT_TYPE::SERVICE_CLIENT',

  /**
   * @dev Declare that the session was issued for direct grants.
   */
  Account = 'GRANT_TYPE::ACCOUNT',
}

/**
 * @dev Declare Session Type
 */
export enum SessionType {
  /**
   * @dev Declare that the session was for auth purpose.
   */
  Direct = 'SESSION_TYPE::DIRECT',

  /**
   * @dev Declare that the session was for oauth purpose.
   */
  OAuth = 'SESSION_TYPE::OAUTH',
}

export enum PreMatureScope {
  /**
   * @dev Declare that the session was for reset credential purpose.
   */
  VerifyEmail = 'verify-email.scope.account',

  /**
   * @dev Declare the session was for confirming 2 factors purpose.
   */
  ConfirmTwoFactor = 'confirm-2fa.scope.account',

  /**
   * @dev Declare the session was for resetting password purpose.
   */
  ResetPassword = 'reset-password.scope.account',
}

/**
 * @dev Declare auth session entity.
 */
export class PreMatureAuthSessionEntity {
  /**
   * @dev Declare that the session was authorized for a party.
   */
  authorizedPartyId: string;

  /**
   * @dev Associated premature scopes.
   */
  scopes: PreMatureScope[];

  /**
   * @dev Declare grant type.
   */
  grantType: GrantType;

  /**
   * @dev Declare actor that authorized this session.
   */
  actorId: string;

  /**
   * @dev Checksum hash.
   */
  checksum: string;

  /**
   * @dev Declare session type.
   */
  sessionType: SessionType;

  /**
   * @dev Declare date/
   */
  expiryDate: Date;
}
