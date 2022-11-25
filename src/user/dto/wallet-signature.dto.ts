import { IsEthereumAddress, IsHexadecimal, IsString } from 'class-validator';

export class EVMWalletSignatureDto {
  /**
   * @dev Desired wallet must be ETH address
   */
  @IsEthereumAddress()
  desiredWallet: string;

  @IsHexadecimal()
  signature: string;
}

export class SolanaWalletSignatureDto {
  @IsString()
  desiredWallet: string;

  @IsHexadecimal()
  signature: string;
}
