import { Injectable } from '@nestjs/common';

import { UserService } from '../../user/services/user.service';
import { EmailProvider } from '../../providers/email.provider';
import { OtpService } from './otp.service';

/**
 * @dev Account Verifier handles all verification related logic.
 */
@Injectable()
export class AccountVerificationService {
  constructor(
    /**
     * @dev Inject providers
     */
    private readonly emailProvider: EmailProvider,

    /**
     * @dev Inject services
     */
    private readonly userService: UserService,
    private readonly otpService: OtpService,
  ) {}
  /**
   * @dev Request email verification for an email.
   * @param email
   */
  public async requestEmailVerification(email: string) {
    /**
     * @dev generate the OTP.
     */
    const otp = await this.otpService.generateOTPToken(email);

    /**
     * @dev Send the email with the email context.
     */
    return this.emailProvider.sendVerificationEmail({ token: otp }, email);
  }

  /**
   * @dev Verify email OTP.
   * @param authJwt
   * @param email
   * @param otp
   */
  public async verifyEmailOTP(authJwt: string, email: string, otp: string) {
    /**
     * @dev Verify OTP first.
     */
    await this.otpService.verifyOTPSession(email, otp);

    /**
     * @dev Update user profile.
     */
    return this.userService.updateUserProfile(authJwt, {
      email_verified: true,
    });
  }
}
