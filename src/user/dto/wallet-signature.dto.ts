import { IsEthereumAddress, IsHexadecimal } from 'class-validator';

export class EVMWalletSignatureDto {
  /**
   * @dev Desired wallet must be ETH address
   */
  @IsEthereumAddress()
  desiredWallet: string;

  @IsHexadecimal()
  signature: string;
}
