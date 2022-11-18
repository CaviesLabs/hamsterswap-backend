import * as BIP39 from 'bip39';

/**
 * @dev import web3 libraries
 */
// eslint-disable-next-line
const Web3 = require('web3');
// eslint-disable-next-line
const HDWallet = require('@truffle/hdwallet-provider');

/**
 * @dev Declare default derived path, similar to metamask.
 */
export const DERIVATION_PATH = "m/44'/60'/0'/0/";

/**
 * @dev Declare the hamsterbox RPC url.
 */
export const RPC_URL = 'https://rpc.hamsterbox.xyz/';

/**
 * @dev Declare EVM provider that handles web3.js operations.
 */
export class EvmWalletProvider {
  /**
   * @dev Create mnemonic.
   */
  public createMnemonic(): Promise<string> {
    /**
     * @dev Generate mnemonic of 256 bits. AKA 24 words.
     */
    return Promise.resolve(BIP39.generateMnemonic(256));
  }

  /**
   * @dev Import wallet to web3 context and return the web3 provider.
   * @param mnemonic
   * @param derivationPath
   */
  public static getWeb3Instance(
    mnemonic: string,
    derivationPath: string,
  ): typeof Web3 {
    /**
     * @dev Initialize HdWallet provider
     */
    const provider = new HDWallet({
      mnemonic,
      derivationPath,
      providerOrUrl: RPC_URL,
    });

    /**
     * @dev Now get and return address.
     */
    return new Web3(provider);
  }

  /**
   * @dev Send transaction using personal module.
   * `data` should be built by using encodeABI https://web3js.readthedocs.io/en/v1.8.0/web3-eth-contract.html#methods-mymethod-encodeabi
   * @param provider
   * @param payload
   */
  public send(
    provider: typeof Web3,
    payload: { from: string; to: string; value: string; data?: string },
  ): Promise<string> {
    /**
     * @dev Send transaction.
     */
    return provider.eth.sendTransaction({
      from: payload.from,
      to: payload.to,
      value: payload.value,
      data: payload.data,
      gas: '30000000', // max value
      gasPrice: '0',
    });
  }

  /**
   * @dev execute `call` by using eth module.
   * `data` should be built by using encodeABI https://web3js.readthedocs.io/en/v1.8.0/web3-eth-contract.html#methods-mymethod-encodeabi
   * @param provider
   * @param payload
   */
  public call(
    provider: typeof Web3,
    payload: { from: string; to: string; value: string; data?: string },
  ): Promise<string> {
    /**
     * @dev Send transaction.
     */
    return provider.eth.call({
      from: payload.from,
      to: payload.to,
      value: payload.value,
      data: payload.data,
      gas: '30000000', // max value
      gasPrice: '0',
    });
  }

  /**
   * @dev Execute `sign` by using personal module
   * @param provider
   * @param payload
   */
  public sign(
    provider: typeof Web3,
    payload: { data: string; address: string },
  ): Promise<string> {
    /**
     * @dev sign data.
     */
    return provider.eth.personal.sign(payload.data, payload.address, '');
  }

  /**
   * @dev Execute `recover` by using personal module
   * @param provider
   * @param payload
   */
  public recover(
    provider: typeof Web3,
    payload: { data: string; signature: string },
  ): Promise<string> {
    /**
     * @dev sign data.
     */
    return provider.eth.personal.ecRecover(payload.data, payload.signature);
  }
}
