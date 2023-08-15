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
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

/**
 * @dev Import deps
 */
import { UtilsProvider } from '../../providers/utils.provider';
import { TokenIssuerService } from '../services/token-issuer.service';
import {
  CommonApiResponse,
  CommonResponse,
} from '../../api-docs/api-response.decorator';
import { AuthSessionService } from '../services/auth-session.service';
import { JWTPayload } from '../../providers/hash/jwt.provider';
import { IntrospectDto } from '../dto/introspect.dto';
import { AuthChallengeEntity } from '../entities/auth-challenge.entity';
import { AuthChallengeDto } from '../dto/auth-challenge.dto';
import { AuthChallengeService } from '../services/auth-challenge.service';
import { AuthChallengeModel } from '../../orm/model/auth-challenge.model';
import { JwtAuthSession } from '../strategies/premature-auth.strategy';
import { AuthScope } from '../entities/auth-session.entity';

/**
 * @dev Hamsterbox Auth controller.
 */
@Controller('auth')
@ApiTags('auth')
export class AuthController {
  /**
   * @dev Constructor that initializes AuthController.s
   * @param sessionService
   * @param tokenIssuerService
   * @param authChallengeService
   */
  constructor(
    private readonly sessionService: AuthSessionService,
    private readonly tokenIssuerService: TokenIssuerService,
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
  @UseGuards(AuthGuard('jwt'))
  @SetMetadata('scopes', [AuthScope.WriteProfile])
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/logout')
  public async logOutFromAllSessions(@Request() req): Promise<void> {
    /**
     * @dev Extract session.
     */
    const { user } = req.user as JwtAuthSession;

    /**
     * @dev Return code response.
     */
    return this.sessionService.deleteAllSessions(user.id);
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
   * @dev Request an auth challenge.
   * @param body
   */
  @CommonApiResponse(CommonResponse.WRONG_FIELD_FORMATS)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Request auth challenge.',
    type: AuthChallengeEntity,
  })
  @ApiBearerAuth('jwt')
  @SetMetadata('scopes', [AuthScope.WriteProfile])
  @HttpCode(HttpStatus.CREATED)
  @Post('/challenge/request')
  public async requestAuthChallenge(
    @Body() body: AuthChallengeDto,
  ): Promise<AuthChallengeModel> {
    return this.authChallengeService.generateAuthChallenge(body.target);
  }
}
