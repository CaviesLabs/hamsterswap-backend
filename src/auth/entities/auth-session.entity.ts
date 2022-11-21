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

export enum AuthScope {
  ReadProfile = 'read.scope.account',

  WriteProfile = 'write.scope.account',
}

/**
 * @dev Declare auth session entity.
 */
export class AuthSessionEntity {
  /**
   * @dev Declare that the session was authorized for a party.
   */
  authorizedPartyId: string;

  /**
   * @dev Associated premature scopes.
   */
  scopes: AuthScope[];

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
