import { Injectable } from '@nestjs/common';
import { authenticator, totp } from 'otplib';
import * as qrcode from 'qrcode';

/**
 * @dev Export for typescript reference.
 */
export interface OTPConfig {
  secret: string;
  createdAt: string;
  step: number;
}
export interface OTPIdentity {
  accountEmail: string;
  appName: string;
}

/**
 * @dev Declare OTP provider.
 */
@Injectable()
export class OtpProvider {
  /**
   * @dev Instance builder.
   * @param epoch
   * @param step
   * @private
   */
  private static getOtpInstance(epoch: number, step = 60) {
    return totp.create({
      ...totp.options,
      step,
      epoch,
      window: [0, 1],
      digits: 6,
    });
  }

  /**
   * @dev Generate token based on secret string.
   * @param secret
   * @param createdAt
   * @param step
   */
  public generateToken(secret: string, createdAt: string, step = 60): string {
    const epoch = new Date(createdAt).getTime();
    return OtpProvider.getOtpInstance(epoch, step).generate(secret);
  }

  /**
   * @dev Verify token using secret otp.
   * @param token
   * @param secret
   * @param createdAt
   * @param step
   */
  public verify(
    token: string,
    secret: string,
    createdAt: string,
    step = 60,
  ): boolean {
    const epoch = new Date(createdAt).getTime();
    const currentDate = Date.now();

    const otpInstance = OtpProvider.getOtpInstance(epoch, step);

    return (
      currentDate - epoch <= otpInstance.allOptions().step * 1000 &&
      otpInstance.verify({ token, secret })
    );
  }

  /**
   * @dev gene
   * @param otpConfig
   * @param otpId
   */
  public generateOTPQRCode(
    otpConfig: OTPConfig,
    otpId: OTPIdentity,
  ): Promise<string> {
    return new Promise((resolve) => {
      /**
       * @dev Extracts variables.
       */
      const { secret, createdAt, step } = otpConfig;
      const { accountEmail, appName } = otpId;

      /**
       * @dev Initialize OTP instance.
       */
      const epoch = new Date(createdAt).getTime();
      const otpInstance = OtpProvider.getOtpInstance(epoch, step);

      /**
       * @dev Return QR code in base64 format.
       */
      return resolve(
        qrcode.toDataURL(otpInstance.keyuri(accountEmail, appName, secret)),
      );
    });
  }

  /**
   * @dev Generate secret.
   */
  public generateTOTPSecret(): string {
    return authenticator.generateSecret(32);
  }

  /**
   * @dev Generate secret.
   */
  public async generateTOTPQRCode(
    otpConfig: OTPConfig,
    otpId: OTPIdentity,
  ): Promise<string> {
    /**
     * @dev Extract variables
     */
    const { secret } = otpConfig;
    const { accountEmail, appName } = otpId;

    /**
     * @dev Return QR Code.
     */
    return qrcode.toDataURL(
      authenticator.keyuri(accountEmail, appName, secret),
    );
  }

  /**
   * @dev Verify TOTP with Google authenticator standard.
   * @param secret
   * @param token
   */
  public verifyTOTP(secret: string, token: string): boolean {
    return authenticator.verify({ secret, token });
  }
}
