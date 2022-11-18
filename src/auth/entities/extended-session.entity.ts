/**
 * @dev Define session distribution type
 */
export enum SessionDistributionType {
  /**
   * @dev The session was issued by hamsterpassport
   */
  PreMature = 'SESSION_DISTRIBUTION_TYPE::PRE_MATURE',

  /**
   * @dev The session was issued by Keycloak
   */
  KeyCloak = 'SESSION_DISTRIBUTION_TYPE::KEYCLOAK',
}

/**
 * @dev Define User activity entity
 * - Use for storing last active time of user
 */
export class ExtendedSessionEntity {
  /**
   * @dev based session id.
   */
  sessionOrigin: string;

  /**
   * @dev Session distribution type.
   */
  distributionType: SessionDistributionType;

  /**
   * @dev Define IDP memo.
   */
  enabledIdpId: string;

  /**
   * @dev User id.
   */
  userId: string;

  /**
   * @dev User ip
   */
  userIpAddress: string[];

  /**
   * @dev User agent.
   */
  userAgent: string[];

  /**
   * @dev Last active time.
   */
  lastActiveTime: Date;
}
