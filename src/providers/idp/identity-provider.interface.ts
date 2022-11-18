/**
 * @dev Identity provider interface.
 */
export interface IdentityProviderInterface<Identity> {
  /**
   * @dev Type of IdentityProviderInterface
   */
  type: AvailableIdpResourceName;

  /**
   * @dev Secret hash
   */
  secret?: string | Record<string, string>;

  /**
   * @dev Function to verify user identity
   * @param signature
   */
  verify(signature: string | Record<string, string>): Promise<Identity>;

  /**
   * @dev Function to get memo of IDP
   * @param data memo data
   */
  getMemo(data: string): string;
}

/**
 * @dev Available Identity Provider.
 */
export enum AvailableIdpResourceName {
  EVMWallet = 'IDENTITY_PROVIDER::EVM_WALLET',
  SolanaWallet = 'IDENTITY_PROVIDER::SOLANA_WALLET',
  Google = 'IDENTITY_PROVIDER::GOOGLE',
  Web3Auth = 'IDENTITY_PROVIDER::WEB3_AUTH',
  MagicLink = 'IDENTITY_PROVIDER::MAGIC_LINK',
}

/**
 * @dev Define Idp short name
 */
export enum IdpShortName {
  EVMWallet = 'evm-wallet',
  SolanaWallet = 'solana-wallet',
  Google = 'google',
  Web3Auth = 'web3-auth',
  MagicLink = 'magic-link',
}

/**
 * @dev Export name mapping.
 */
export const IdpMapName = {
  [IdpShortName.EVMWallet]: AvailableIdpResourceName.EVMWallet,
  [IdpShortName.SolanaWallet]: AvailableIdpResourceName.SolanaWallet,
  [IdpShortName.Google]: AvailableIdpResourceName.Google,
  [IdpShortName.Web3Auth]: AvailableIdpResourceName.Web3Auth,
  [IdpShortName.MagicLink]: AvailableIdpResourceName.MagicLink,
};
