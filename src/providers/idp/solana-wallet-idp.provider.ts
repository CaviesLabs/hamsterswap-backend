// eslint-disable-next-line
import { sign } from 'tweetnacl';
import * as Bs from 'bs58';

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
export type SolanaWalletIdentity = {
  identityId: string;
};

/**
 * @dev Signature data to verify identity.
 */
export class SolanaSignatureData implements Record<string, string> {
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
 * @dev Solana Identity Provider.
 */
export class SolanaWalletIdpProvider
  implements IdentityProviderInterface<SolanaWalletIdentity>
{
  /**
   * @dev Type of Idp provider.
   */
  type: AvailableIdpResourceName = AvailableIdpResourceName.SolanaWallet;
  private _verify(
    rawMessage: string,
    signedData: string,
    walletAddress: string,
  ): boolean {
    const encodedMessage = new TextEncoder().encode(rawMessage);
    return sign.detached.verify(
      encodedMessage,
      Bs.decode(signedData),
      Bs.decode(walletAddress),
    );
  }
  /**
   * @dev verify identity based on the signature data.
   * @param signatureData
   */
  public async verify({
    desiredWallet,
    rawContent,
    signature,
  }: SolanaSignatureData): Promise<SolanaWalletIdentity | null> {
    /**
     * @dev Initially set result is null.
     */
    if (this._verify(rawContent, signature, desiredWallet)) {
      /**
       * @dev Return result.
       */
      return { identityId: desiredWallet };
    }
    return null;
  }

  /**
   * @dev get Solana IDP memo
   * @param data memo data
   */
  public getMemo(data: string): string {
    return `${AvailableIdpResourceName.SolanaWallet}-${data}`;
  }
}
