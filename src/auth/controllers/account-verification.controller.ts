import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  SetMetadata,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * @dev Import logic deps
 */
import {
  CommonApiResponse,
  CommonResponse,
} from '../../api-docs/api-response.decorator';
import { RequestVerifyOtpEmailDto } from '../dto/request-verify-otp-email.dto';
import { RestrictPrematureSessionGuard } from '../guards/restrict-premature-session.guard';
import { RestrictPrematureGrantTypeGuard } from '../guards/restrict-premature-grant-type.guard';
import {
  AllowedResource,
  RestrictPrematureRequestedResourceGuard,
} from '../guards/restrict-premature-requested-resource.guard';
import { RestrictPrematureScopeGuard } from '../guards/restrict-premature-scope.guard';
import {
  GrantType,
  PreMatureScope,
  SessionType,
} from '../entities/auth-session.entity';
import { VerifyEmailOtpDto } from '../dto/verify-email-otp.dto';
import { UserEntity } from '../../user/entities/user.entity';
import { KeycloakAuthSession } from '../strategies/keycloak-auth.strategy';
import { OtpPolicyService } from '../../account-policy/services/opt-policy.service';
import { AccountVerificationService } from '../services/account-verification.service';
import { UserService } from '../../user/services/user.service';

@Controller('auth')
@ApiTags('account-verification')
export class AccountVerificationController {
  constructor(
    private readonly otpPolicyService: OtpPolicyService,
    private readonly userService: UserService,
    private readonly accountVerifierService: AccountVerificationService,
  ) {}
  /**
   * @dev Send verification email.
   * @param body
   */
  @CommonApiResponse(
    CommonResponse.UNAUTHORIZED_SESSION,
    CommonResponse.FORBIDDEN_SESSION,
    CommonResponse.WRONG_FIELD_FORMATS,
  )
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Sent request email verification link to email successfully',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('/verify/email/request')
  public async requestVerificationEmail(
    @Body() body: RequestVerifyOtpEmailDto,
  ): Promise<void> {
    /**
     * @dev check the policy lock for:
     * - maximum 5 time/hour
     * - freeze 60s per sent
     */
    await this.otpPolicyService.mustNotOverResendEmailOtpRate(body.email);
    await this.otpPolicyService.mustNotOverResendEmailOtpLimit(body.email);

    /**
     * @dev Calling request request email verification.
     */
    await this.accountVerifierService.requestEmailVerification(body.email);

    /**
     * @dev increase resend OTP counter
     */
    await this.otpPolicyService.countResendEmailOtp(body.email);
  }

  /**
   * @dev Verify email OTP
   * @param req
   * @param verifyEmailDto
   */
  @CommonApiResponse(
    CommonResponse.UNAUTHORIZED_SESSION,
    CommonResponse.FORBIDDEN_SESSION,
    CommonResponse.WRONG_FIELD_FORMATS,
  )
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Verify email successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Email was verified cannot be verified again.',
  })
  @ApiBearerAuth('jwt')
  @HttpCode(HttpStatus.OK)
  @UseGuards(
    AuthGuard('jwt'),
    RestrictPrematureSessionGuard,
    RestrictPrematureGrantTypeGuard,
    RestrictPrematureRequestedResourceGuard,
    RestrictPrematureScopeGuard,
  )
  @SetMetadata('sessionType', [SessionType.Direct])
  @SetMetadata('grantType', [GrantType.Account])
  @SetMetadata('resource', [AllowedResource.ACCOUNT])
  @SetMetadata('scopes', [PreMatureScope.VerifyEmail])
  @Post('/verify/email/confirm')
  public async verifyEmail(
    @Request() req,
    @Body() verifyEmailDto: VerifyEmailOtpDto,
  ): Promise<UserEntity> {
    /**
     * @dev Extract session.
     */
    const { user, token } = req.user as KeycloakAuthSession;

    /**
     * @dev Raise errors if email was already verified.
     */
    if (user.email_verified) {
      throw new UnprocessableEntityException(
        'ACCOUNT::EMAIL_WAS_ALREADY_VERIFIED',
      );
    }

    /**
     * @dev Calling verify email otp.
     */
    const result = await this.accountVerifierService.verifyEmailOTP(
      token,
      verifyEmailDto.email,
      verifyEmailDto.token,
    );

    /**
     * @dev Update user email after verification.
     */
    await this.userService.updateUserEmail(user.sub, verifyEmailDto.email);

    /**
     * @dev Return result.
     */
    return result;
  }
}
