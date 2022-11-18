// eslint-disable-next-line
const Web3 = require('web3');

/**
 * @dev Import deps
 */
import {
  AvailableIdpResourceName,
  IdentityProviderInterface,
} from './identity-provider.interface';

/**
 * @dev Wallet Identity stores wallet address.
 */
export type EVMWalletIdentity = {
  identityId: string;
};

/**
 * @dev Signature data to verify identity.
 */
export class EVMSignatureData implements Record<string, string> {
  [x: string]: string;
  /**
   * @dev Hashed signature from `personal_sign`
   */
  signature: string;

  /**
   * @dev Raw content that has been signed.
   */
  rawContent: string;

  /**
   * @dev Desired wallet.
   */
  desiredWallet: string;
}

/**
 * @dev EVM Identity Provider.
 */
export class EVMWalletIdpProvider
  implements IdentityProviderInterface<EVMWalletIdentity>
{
  /**
   * @dev Type of Idp provider.
   */
  type: AvailableIdpResourceName = AvailableIdpResourceName.EVMWallet;

  /**
   * @dev verify identity based on the signature data.
   * @param signatureData
   */
  public async verify(
    signatureData: EVMSignatureData,
  ): Promise<EVMWalletIdentity | null> {
    const web3Instance = new Web3();

    /**
     * @dev Initially set result is null.
     */
    let result = null;

    try {
      /**
       * @dev Recover message
       */
      const walletAddress = await web3Instance.eth.personal.ecRecover(
        signatureData.rawContent,
        signatureData.signature,
      );

      /**
       * @dev Desired wallet must match recovered wallet.
       */
      if (
        walletAddress.toLowerCase() ===
        signatureData.desiredWallet.toLowerCase()
      ) {
        result = {
          identityId: walletAddress.toLowerCase(),
        };
      }
    } catch {}

    /**
     * @dev Return result.
     */
    return result;
  }

  /**
   * @dev get EVM IDP memo
   * @param data memo data
   */
  public getMemo(data: string): string {
    return `${AvailableIdpResourceName.EVMWallet}-${data}`;
  }
}
