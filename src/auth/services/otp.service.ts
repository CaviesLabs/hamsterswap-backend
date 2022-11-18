import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';

import { UtilsProvider } from '../../providers/utils.provider';
import { OtpProvider } from '../../providers/two-factors/otp.provider';
import {
  AuthChallengeDocument,
  AuthChallengeModel,
} from '../../orm/model/auth-challenge.model';
import { AuthChallengeService } from './auth-challenge.service';

/**
 * @dev Otp service will handle all otp related logic
 */
@Injectable()
export class OtpService {
  constructor(
    /**
     * @dev Inject providers
     */
    private readonly otpProvider: OtpProvider,

    /**
     * @dev Inject services
     */
    private readonly authChallengeService: AuthChallengeService,

    /**
     * @dev Inject auth challenge model.
     */
    @InjectModel(AuthChallengeModel.name)
    private readonly AuthChallengeDocument: Model<AuthChallengeDocument>,
  ) {}
  /**
   * @dev Generate OTP token.
   * @param target
   * @param step
   */
  public async generateOTPToken(target: string, step = 60): Promise<string> {
    /**
     * @dev Generate auth challenge first.
     */
    const authChallenge = await this.authChallengeService.generateAuthChallenge(
      target,
      step,
    );
    /**
     * @dev Generate OTP token based on the auth challenge we've just created.
     */
    return this.otpProvider.generateToken(
      new UtilsProvider().removeWhitespaceAndNewline(authChallenge.memo),
      authChallenge.createdAt,
      step,
    );
  }

  /**
   * @notice Verify email OTP.
   * @param target
   * @param token
   */
  public async verifyOTPSession(target: string, token: string) {
    /**
     * @dev Find the latest OTP that associated with the target.
     */
    const latestAuthChallenge = await this.AuthChallengeDocument.findOne(
      {
        target,
        isResolved: false,
      },
      {},
      { sort: '-createdAt' },
    );

    /**
     * @dev Compare conditions make sure the OTP is valid.
     */
    if (
      !latestAuthChallenge ||
      !this.otpProvider.verify(
        token,
        new UtilsProvider().removeWhitespaceAndNewline(
          latestAuthChallenge.memo,
        ),
        latestAuthChallenge.createdAt,
        latestAuthChallenge.durationDelta,
      )
    ) {
      throw new BadRequestException('AUTH::AUTH_CHALLENGE::INVALID_OTP');
    }

    /**
     * @dev Verify and resolve auth challenge.
     */
    await this.authChallengeService.resolveAuthChallenge(
      latestAuthChallenge.id,
    );

    /**
     * @dev Return the auth challenge.
     */
    return latestAuthChallenge;
  }
}
