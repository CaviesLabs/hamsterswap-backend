import {
  AvailableIdpResourceName,
  IdentityProviderInterface,
} from './identity-provider.interface';
import { JWTPayload } from '../hash/jwt.provider';
import { NetworkProvider } from '../network.provider';

/**
 * @dev Google Identity.
 */
export type GoogleIdentity = {
  email: string;
  identityId: string;
};

class TokenInfoResponse extends JWTPayload {
  email: string;
  sub: string;
}

/**
 * @dev Google IDP provider
 */
export class GoogleIdpProvider
  implements IdentityProviderInterface<GoogleIdentity>
{
  /**
   * @dev Declare type of this provider
   */
  type: AvailableIdpResourceName = AvailableIdpResourceName.Google;

  /**
   * @dev Verify identity.
   * @param signature
   */
  public async verify(signature: string): Promise<GoogleIdentity | null> {
    const networkProvider = new NetworkProvider();
    /**
     * @dev First need to introspect the access token.
     */
    const url = `https://oauth2.googleapis.com/tokeninfo?access_token=${signature}`;
    try {
      const result = await networkProvider.request<TokenInfoResponse>(url, {
        method: 'GET',
      });
      /**
       * @dev return null if the result isn't valid.
       */
      if (!result || !result.email || !result.sub) {
        return null;
      }

      return {
        email: result.email,
        identityId: result.sub,
      };
    } catch {
      return null;
    }
  }

  /**
   * @dev get Google IDP memo
   * @param data memo data
   */
  public getMemo(data: string): string {
    return `${AvailableIdpResourceName.Google}-${data}`;
  }
}
