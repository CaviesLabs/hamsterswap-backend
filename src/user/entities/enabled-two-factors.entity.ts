import { AvailableTwoFactorProvider } from '../../providers/two-factors/two-factor-provider.interface';

/**
 * @dev Define two factors enabled status.
 */
export enum TwoFactorsEnabledStatus {
  /**
   * @dev The two factors was just created, but not activated.
   */
  PENDING = 'TWO_FACTOR_STATUS::PENDING',
  /**
   * @dev The two factors was activated and can be fully functional.
   */
  ACTIVATED = 'TWO_FACTOR_STATUS::ACTIVATED',
}

/**
 * @dev Define Enabled two factors entity,
 */
export class EnabledTwoFactorsEntity {
  /**
   * @dev The user that enables two factors auth method.
   */
  userId: string;

  /**
   * @dev Type of two factors auth method,
   */
  type: AvailableTwoFactorProvider;

  /**
   * @dev The encrypted data hash to verify signature.
   */
  dataHash: string;

  /**
   * @dev Status of the current two factors auth method.
   */
  status: TwoFactorsEnabledStatus;
}
