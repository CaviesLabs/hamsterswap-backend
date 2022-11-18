/**
 * @dev Define the two factor interface.
 */
export interface TwoFactorProviderInterface {
  /**
   * @dev
   */
  type: AvailableTwoFactorProvider;

  /**
   * @dev Secret data to verify.
   */
  secret: string | Record<string, string>;

  /**
   * @dev Verify signature using the `secret` data.
   * @param signature
   * @param salt - optional `salt` can be put in.
   */
  verify(
    signature: string | Record<string, string>,
    salt?: string,
  ): Promise<boolean>;

  /**
   * @dev Generate data hash using `salt` and `secret` data.
   * @param salt - optional `salt` can be put in.
   */
  generateDataHash(salt?: string): Promise<string | Record<string, string>>;
}

/**
 * @dev Export enum for further usage
 */
export enum AvailableTwoFactorProvider {
  /**
   * @dev Google authenticator standard. Ref: https://en.wikipedia.org/wiki/Google_Authenticator
   */
  GoogleAuth = 'TWO_FACTOR_PROVIDER::GOOGLE_AUTH',

  /**
   * @dev Simple email OTP.
   */
  Email = 'TWO_FACTOR_PROVIDER::EMAIL',
}
