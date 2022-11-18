import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';

import {
  TwoFactorsDocument,
  TwoFactorsModel,
} from '../../orm/model/auth-two-factors.model';
import { UserEntity } from '../../user/entities/user.entity';
import { AESHashProvider } from '../../providers/hash/hashing.provider';
import { TwoFactorsEntity } from '../../user/entities/two-factors.entity';
import { OtpProvider } from '../../providers/two-factors/otp.provider';
import { RegistryProvider } from '../../providers/registry.provider';

/**
 * @dev TwoFactor service will handle all 2fa related logic
 */
@Injectable()
export class TwoFactorsService {
  constructor(
    /**
     * @dev Inject two factors model.
     */
    @InjectModel(TwoFactorsModel.name)
    private readonly TwoFactorsDocument: Model<TwoFactorsDocument>,

    /**
     * @dev Inject OTP Provider
     */
    private readonly otpProvider: OtpProvider,
    private readonly registryProvider: RegistryProvider,
  ) {}

  /**
   * @dev Get 2FA with user id.
   * @param userId
   * @private
   */
  private async getOrCleanup2FA(
    userId: string,
  ): Promise<TwoFactorsDocument | null> {
    /**
     * @dev Query the two factor document.
     */
    const twoFactor = await this.TwoFactorsDocument.findOne({ userId });

    /**
     * @dev Return valid two factor document.
     */
    if (twoFactor) {
      /**
       * @dev `confirmedAt` must be less than `confirmedExpiryDate`
       */
      if (
        !!twoFactor.confirmedAt &&
        twoFactor.confirmedAt <= twoFactor.confirmedExpiryDate
      ) {
        return twoFactor;
      }

      /**
       * @dev Delete invalid two factors config.
       */
      await this.TwoFactorsDocument.findOneAndRemove({ userId });
    }

    /**
     * @dev Return null
     */
    return null;
  }

  /**
   * @dev Request 2 factors auth
   */
  public async request2FA(
    user: UserEntity,
  ): Promise<{ secret: string; base64QrCode: string }> {
    /**
     * @dev Get current 2FA.
     */
    const current2FA = await this.getOrCleanup2FA(user.sub);

    /**
     * @dev Raise error if 2FA was already enabled.
     */
    if (current2FA) {
      throw new ConflictException('AUTH::2FA_ALREADY_ENABLED');
    }

    /**
     * @dev Secret code
     */
    const secretCode = this.otpProvider.generateTOTPSecret();

    /**
     * @dev Encrypt the secret code
     */
    const secretToken = this.registryProvider.getConfig().SECRET_TOKEN;
    const aesHashProvider = new AESHashProvider(secretToken);
    const hash = await aesHashProvider.encrypt(secretCode);

    /**
     * @dev Construct two factors document and store at the db.
     */
    const confirmedDate = new Date();
    /**
     * @dev Valid confirmed date will be 1 day.
     */
    confirmedDate.setDate(new Date().getDate() + 1);

    const twoFactors = new this.TwoFactorsDocument({
      userId: user.sub,
      hash,
      confirmedExpiryDate: confirmedDate.getTime(),
      step: 30, // default at 30, same as google authenticator and authy.
    } as TwoFactorsEntity);

    /**
     * @dev Return the document.
     */
    await twoFactors.save();

    return {
      /**
       * @dev Return raw secret code. Only once.
       */
      secret: secretCode,
      /**
       * @dev Return the QR Code. Once.
       */
      base64QrCode: await this.otpProvider.generateTOTPQRCode(
        {
          createdAt: twoFactors.createdAt,
          step: twoFactors.step,
          secret: secretCode,
        },
        {
          accountEmail: user.email,
          appName: this.registryProvider.getConfig().DOMAIN,
        },
      ),
    };
  }

  /**
   * @dev Verify 2FA Code.
   * @param userId
   * @param token
   */
  public async verify2FACode(
    userId: string,
    token: string,
  ): Promise<TwoFactorsDocument> {
    /**
     * @dev Get current 2FA
     */
    const current2FA = await this.TwoFactorsDocument.findOne({ userId });

    /**
     * @dev Raise error if no 2FA found.
     */
    if (!current2FA) {
      throw new BadRequestException('AUTH::INVALID_OTP');
    }

    /**
     * @dev Decode secret hash to verify OTP.
     */
    const secretToken = this.registryProvider.getConfig().SECRET_TOKEN;
    const aesHashProvider = new AESHashProvider(secretToken);
    const secretHash = await aesHashProvider.decrypt(current2FA.hash);

    /**
     * @dev verify by comparing expiry date.
     */
    if (
      !!current2FA.confirmedAt &&
      current2FA.confirmedAt > current2FA.confirmedExpiryDate
    ) {
      throw new BadRequestException('AUTH::INVALID_OTP');
    }

    /**
     * @dev Verify by algorithm
     */
    if (!this.otpProvider.verifyTOTP(secretHash, token)) {
      throw new BadRequestException('AUTH::INVALID_OTP');
    }

    /**
     * @dev Return the current 2FA document.
     */
    return current2FA;
  }

  /**
   * @dev Confirm 2FA code.
   * @param userId
   * @param token
   */
  public async confirm2FAEnabled(userId: string, token: string): Promise<void> {
    /**
     * @dev Verify 2FA code first.
     */
    const current2FA = await this.verify2FACode(userId, token);

    /**
     * @dev Raise error if the 2FA was already confirmed.
     */
    if (
      !!current2FA.confirmedAt &&
      current2FA.confirmedAt <= current2FA.confirmedExpiryDate
    ) {
      throw new ConflictException('AUTH::OTP_ALREADY_CONFIRMED');
    }

    /**
     * @dev Update the status again.
     */
    current2FA.confirmedAt = new Date().getTime();

    /**
     * @dev Finally save the 2FA.
     */
    await current2FA.save();
  }
}
