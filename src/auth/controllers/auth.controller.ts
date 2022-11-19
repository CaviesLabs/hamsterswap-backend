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
   * @param otpService
   */
  constructor(
    private readonly otpPolicyService: OtpPolicyService,
    private readonly authService: AuthenticationService,
    private readonly sessionService: AuthSessionService,
    private readonly permissionService: PermissionService,
    private readonly tokenIssuerService: TokenIssuerService,
    private readonly otpService: OtpService,
    private readonly authChallengeService: AuthChallengeService,
  ) {}

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
  @HttpCode(HttpStatus.CREATED)
  @Post('/permission/wallet/request')
  public async requestWalletPermission(
    @Request() req,
    @Body() requestWalletPermissionDto: RequestWalletPermissionDto,
  ): Promise<TokenSetEntity> {
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
