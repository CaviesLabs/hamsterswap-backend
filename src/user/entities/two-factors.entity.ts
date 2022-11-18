/**
 * @dev Deprecated. TODO: migrate to EnabledTwoFactors instead.
 */
/**
 * @dev Declare Two factor entity
 */
export class TwoFactorsEntity {
  /**
   * @dev Encrypted hash.
   */
  hash: string;

  /**
   * @dev user id.
   */
  userId: string;

  /**
   * @dev Confirm expiry date.
   */
  confirmedExpiryDate: number;

  /**
   * @dev Step.
   */
  step: number;

  /**
   * @dev Confirmed at
   */
  confirmedAt: number | null;
}
