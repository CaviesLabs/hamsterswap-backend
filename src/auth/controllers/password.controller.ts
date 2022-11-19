import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  SetMetadata,
  UnauthorizedException,
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
import {
  KeycloakAuthSession,
  KeycloakAuthStrategy,
} from '../strategies/keycloak-auth.strategy';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { UtilsProvider } from '../../providers/utils.provider';
import { TokenSetEntity } from '../entities/token-set.entity';
import { RequestResetPasswordDto } from '../dto/request-reset-password.dto';
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
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { PrematureAuthSession } from '../strategies/premature-auth.strategy';
import { PasswordService } from '../services/password.service';
import { AuthenticationService } from '../services/authentication.service';
import { CreatePasswordDto } from '../dto/create-password.dto';
import { AuthSessionService } from '../services/auth-session.service';

@Controller('auth/password')
@ApiTags('password')
export class PasswordController {
  constructor(
    /**
     * @dev Inject services
     */
    private readonly passwordService: PasswordService,
    private readonly authService: AuthenticationService,
    private readonly sessionService: AuthSessionService,
  ) {}
  /**
   * @dev Update password.
   * @param req
   * @param updatePasswordDto
   */
  @CommonApiResponse(CommonResponse.WRONG_FIELD_FORMATS)
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Update password successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Session is not authorized/Or wrong old password.',
  })
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard(KeycloakAuthStrategy.key))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/update')
  public async updatePassword(
    @Request() req,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    /**
     * @dev Extract session.
     */
    const { user } = req.user as KeycloakAuthSession;

    /**
     * @dev Verify old password first.
     */
    const response =
      await new UtilsProvider().overrideErrorWrap<TokenSetEntity>(
        /**
         * @dev Refresh token. But need to override error and raise unauthorized error only.
         */
        () =>
          this.authService.signInUser({
            email: user.email,
            password: updatePasswordDto.password,
          }),
        {
          exceptionClass: UnauthorizedException,
        },
      );

    if (!response.access_token) {
      throw new UnauthorizedException();
    }

    /**
     * @dev Update new password.
     */
    return this.passwordService.updatePassword(user.sub, updatePasswordDto);
  }

  /**
   * @dev Send reset password link.
   * @param req
   * @param requestResetPasswordDto
   */
  @CommonApiResponse(CommonResponse.WRONG_FIELD_FORMATS)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Sent reset password link to email successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Email is not existed.',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('/reset/request')
  public async requestResetPassword(
    @Request() req,
    @Body() requestResetPasswordDto: RequestResetPasswordDto,
  ): Promise<void> {
    /**
     * @dev Calling request password session service.
     */
    await this.passwordService.requestResetPasswordSession(
      requestResetPasswordDto.email,
    );
  }

  /**
   * @dev Reset password.
   * @param req
   * @param resetPasswordDto
   */
  @CommonApiResponse(
    CommonResponse.UNAUTHORIZED_SESSION,
    CommonResponse.FORBIDDEN_SESSION,
    CommonResponse.WRONG_FIELD_FORMATS,
  )
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Reset password successfully',
  })
  @ApiBearerAuth('jwt')
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
  @SetMetadata('scopes', [PreMatureScope.ResetPassword])
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/reset/confirm')
  public async resetPassword(
    @Request() req,
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<void> {
    /**
     * @dev Extract session.
     */
    const { user, session } = req.user as PrematureAuthSession;

    /**
     * @dev Calling request password session service.
     */
    await this.passwordService.resetPassword(user.id, resetPasswordDto);

    /**
     * @dev Calling logout all user's sessions if needed.
     */
    if (resetPasswordDto.logoutAllSessions) {
      await this.sessionService.deleteAllSessions(user.id);
    }

    /**
     * @dev Delete old session immediately after reset password successfully.
     */
    await this.sessionService.deletePrematureAuthSessionById(session._id);
  }

  /**
   * @dev Create first password.
   */
  @CommonApiResponse(
    CommonResponse.WRONG_FIELD_FORMATS,
    CommonResponse.UNAUTHORIZED_SESSION,
  )
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Create password successfully',
  })
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard(KeycloakAuthStrategy.key))
  @HttpCode(HttpStatus.CREATED)
  @Post('/create')
  public async createPassword(
    @Request() req,
    @Body() body: CreatePasswordDto,
  ): Promise<void> {
    /**
     * @dev Extract session.
     */
    const { user } = req.user as KeycloakAuthSession;

    /**
     * @dev Create first password
     */
    await this.passwordService.createPassword(user.sub, body);
  }
}
