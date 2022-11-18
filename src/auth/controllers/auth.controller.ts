import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  SetMetadata,
  UnauthorizedException,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

/**
 * @dev Import deps
 */
import { AuthenticationService } from '../services/authentication.service';
import { EmailLoginDto } from '../dto/email-login.dto';
import { EmailSignUpDto } from '../dto/email-signup.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { TokenSetEntity } from '../entities/token-set.entity';
import {
  KeycloakAuthSession,
  KeycloakAuthStrategy,
} from '../strategies/keycloak-auth.strategy';
import { UtilsProvider } from '../../providers/utils.provider';
import { TokenIssuerService } from '../services/token-issuer.service';
import {
  KeycloakAccountResourceAccessRolesGuard,
  Role,
} from '../guards/keycloak-account-resource-access-roles.guard';
import { RequestWalletPermissionDto } from '../dto/request-wallet-permission.dto';
import { AuditLoggerContextMap } from '../../audit/audit-logger.service';
import { EventType } from '../../audit/entities/trail.entity';
import {
  CommonApiResponse,
  CommonResponse,
} from '../../api-docs/api-response.decorator';
import { OtpPolicyService } from '../../account-policy/services/opt-policy.service';
import { PermissionService } from '../services/permission.service';
import { OtpService } from '../services/otp.service';
import { AuthSessionService } from '../services/auth-session.service';
import { JWTPayload } from '../../providers/hash/jwt.provider';
import { IntrospectDto } from '../dto/introspect.dto';
import { AuthChallengeEntity } from '../entities/auth-challenge.entity';
import { AuthChallengeDto } from '../dto/auth-challenge.dto';
import { AuthChallengeService } from '../services/auth-challenge.service';
import { AuthChallengeDocument } from '../../orm/model/auth-challenge.model';

/**
 * @dev Hamsterbox Auth controller.
 */
@Controller('auth')
@ApiTags('auth')
export class AuthController {
  /**
   * @dev Constructor that initializes AuthController.s
   * @param otpPolicyService
   * @param authService
   * @param sessionService
   * @param permissionService
   * @param tokenIssuerService
   * @param auditLoggerContextMap
   * @param otpService
   */
  constructor(
    private readonly otpPolicyService: OtpPolicyService,
    private readonly authService: AuthenticationService,
    private readonly sessionService: AuthSessionService,
    private readonly permissionService: PermissionService,
    private readonly tokenIssuerService: TokenIssuerService,
    private readonly auditLoggerContextMap: AuditLoggerContextMap,
    private readonly otpService: OtpService,
    private readonly authChallengeService: AuthChallengeService,
  ) {}

  /**
   * @dev Signup endpoint declaration.
   * @param req
   * @param body
   */
  @CommonApiResponse(
    CommonResponse.UNAUTHORIZED_SESSION,
    CommonResponse.WRONG_FIELD_FORMATS,
  )
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Signed user up successfully',
    type: TokenSetEntity,
  })
  @SetMetadata(EventType, EventType.ACCOUNT_REGISTRATION)
  @HttpCode(HttpStatus.CREATED)
  @Post('/sign-up')
  public async signUp(
    @Request() req,
    @Body() body: EmailSignUpDto,
  ): Promise<TokenSetEntity> {
    /**
     * @dev get audit logger instance
     */
    const auditLogger = this.auditLoggerContextMap.getOrCreate(req.id);

    /**
     * @dev check policy lock for:
     * - maximum invalid OTP 5 times/hour (default)
     */
    await this.otpPolicyService.mustNotOverInvalidEmailOtpLimit(body.email);

    try {
      /**
       * @dev verify email OTP
       */
      await this.otpService.verifyOTPSession(body.email, body.token);
    } catch (e) {
      /**
       * @dev increase invalid OTP counter
       */
      await this.otpPolicyService.countInvalidEmailOtp(body.email);
      throw e;
    }

    /**
     * @dev Refresh token. But need to override error and raise unauthorized error only.
     */
    return new UtilsProvider().overrideErrorWrap<TokenSetEntity>(
      async () => {
        const result = this.authService.signUpUser(body);
        /**
         * @dev Push audit event
         */
        await auditLogger.log({
          eventName: 'Signup succeeded',
          additionalEventData: { email: body.email },
        });
        return result;
      },
      {
        exceptionClass: UnauthorizedException,
      },
    );
  }

  /**
   * @dev Login endpoint declaration.
   * @param req
   * @param loginDto
   */
  @CommonApiResponse(CommonResponse.WRONG_FIELD_FORMATS)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Signed in successfully',
    type: TokenSetEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Wrong email/password format.',
  })
  @SetMetadata(EventType, EventType.ACCOUNT_SIGNIN)
  @HttpCode(HttpStatus.CREATED)
  @Post('/sign-in')
  public async signIn(
    @Request() req,
    @Body() loginDto: EmailLoginDto,
  ): Promise<TokenSetEntity> {
    /**
     * @dev get audit logger instance
     */
    const auditLogger = this.auditLoggerContextMap.getOrCreate(req.id);

    /**
     * @dev Refresh token. But need to override error and raise unauthorized error only.
     */
    return new UtilsProvider().overrideErrorWrap<TokenSetEntity>(
      async () => {
        const result = await this.authService.signInUser(loginDto);
        /**
         * @dev Push audit event
         */
        await auditLogger.log({
          eventName: 'Signin succeeded',
          additionalEventData: { email: loginDto.email },
        });
        return result;
      },
      {
        exceptionClass: UnauthorizedException,
      },
    );
  }

  /**
   * @dev Logout from all sessions.
   * @param req
   */
  @CommonApiResponse(
    CommonResponse.UNAUTHORIZED_SESSION,
    CommonResponse.FORBIDDEN_SESSION,
    CommonResponse.WRONG_FIELD_FORMATS,
  )
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Logout from all sessions.',
  })
  @ApiBearerAuth('jwt')
  @UseGuards(
    AuthGuard(KeycloakAuthStrategy.key),
    KeycloakAccountResourceAccessRolesGuard,
  )
  @SetMetadata('roles', [Role.MANAGE_ACCOUNT])
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/logout')
  public async logOutFromAllSessions(@Request() req): Promise<void> {
    /**
     * @dev Extract session.
     */
    const { user } = req.user as KeycloakAuthSession;

    /**
     * @dev Return code response.
     */
    return this.sessionService.deleteAllSessions(user.sub);
  }

  /**
   * @dev The endpoint is used
   * @param introspectDto
   */
  @CommonApiResponse(CommonResponse.WRONG_FIELD_FORMATS)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Introspected token successfully.',
    type: JWTPayload,
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Cannot introspect token.',
  })
  @HttpCode(HttpStatus.OK)
  @Post('/token/introspect')
  public async introspect(
    @Body() introspectDto: IntrospectDto,
  ): Promise<JWTPayload> {
    return new UtilsProvider().overrideErrorWrap(
      () => this.tokenIssuerService.introspect(introspectDto.token),
      {
        exceptionClass: UnprocessableEntityException,
      },
    );
  }

  /**
   * @dev Refresh access token.
   * @param refreshTokenDto
   */
  @CommonApiResponse(
    CommonResponse.UNAUTHORIZED_SESSION,
    CommonResponse.WRONG_FIELD_FORMATS,
  )
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Refreshed token successfully',
    type: TokenSetEntity,
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('/token/refresh')
  public refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<TokenSetEntity> {
    /**
     * @dev Refresh token. But need to override error and raise unauthorized error only.
     */
    return new UtilsProvider().overrideErrorWrap<TokenSetEntity>(
      () =>
        this.tokenIssuerService.refreshKeycloakAccessToken({
          currentRefreshToken: refreshTokenDto.refresh_token,
        }),
      {
        exceptionClass: UnauthorizedException,
      },
    );
  }

  /**
   * @dev Request an exchange code.
   * @param req
   * @param requestWalletPermissionDto
   */
  @CommonApiResponse(
    CommonResponse.UNAUTHORIZED_SESSION,
    CommonResponse.FORBIDDEN_SESSION,
    CommonResponse.WRONG_FIELD_FORMATS,
  )
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Request wallet permission.',
    type: TokenSetEntity,
  })
  @ApiBearerAuth('jwt')
  @UseGuards(
    AuthGuard(KeycloakAuthStrategy.key),
    KeycloakAccountResourceAccessRolesGuard,
  )
  @SetMetadata('roles', [Role.MANAGE_ACCOUNT])
  @SetMetadata(EventType, EventType.ACCOUNT_REQUEST_WALLET_PERMISSION)
  @HttpCode(HttpStatus.CREATED)
  @Post('/permission/wallet/request')
  public async requestWalletPermission(
    @Request() req,
    @Body() requestWalletPermissionDto: RequestWalletPermissionDto,
  ): Promise<TokenSetEntity> {
    /**
     * @dev get audit logger instance
     */
    const auditLogger = this.auditLoggerContextMap.getOrCreate(req.id);

    /**
     * @dev Extract session.
     */
    const { token } = req.user as KeycloakAuthSession;

    /**
     * @dev Get result.
     */
    const result = await this.permissionService.requestWalletPermission(
      token,
      requestWalletPermissionDto.walletScope,
    );
    /**
     * @dev Push audit event
     */
    await auditLogger.log({
      eventName: 'Request wallet permission succeeded',
      additionalEventData: {
        walletScope: requestWalletPermissionDto.walletScope,
      },
    });

    /**
     * @dev Return response
     */
    return result;
  }

  /**
   * @dev Request an auth challenge.
   * @param req
   * @param body
   */
  @CommonApiResponse(CommonResponse.WRONG_FIELD_FORMATS)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Request auth challenge.',
    type: AuthChallengeEntity,
  })
  @ApiBearerAuth('jwt')
  @HttpCode(HttpStatus.CREATED)
  @Post('/challenge/request')
  public async requestAuthChallenge(
    @Request() req,
    @Body() body: AuthChallengeDto,
  ): Promise<AuthChallengeDocument> {
    return this.authChallengeService.generateAuthChallenge(body.target);
  }
}
