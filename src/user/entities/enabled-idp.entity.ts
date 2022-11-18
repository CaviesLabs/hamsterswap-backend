import { AvailableIdpResourceName } from '../../providers/idp/identity-provider.interface';

/**
 * @dev Define Entity.
 */
export class EnabledIdpEntity {
  /**
   * @dev Identity provider type.
   */
  type: AvailableIdpResourceName;

  /**
   * @dev Linked account id from identity provider.
   */
  identityId: string;

  /**
   * @dev User id that links the identityId.
   */
  userId: string;
}
