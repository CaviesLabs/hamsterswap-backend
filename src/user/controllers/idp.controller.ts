import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UnauthorizedException,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

/**
 * @dev Import deps
 */
import {
  CommonApiResponse,
  CommonResponse,
} from '../../api-docs/api-response.decorator';
import { TokenSetEntity } from '../../auth/entities/token-set.entity';
import { UtilsProvider } from '../../providers/utils.provider';
import {
  IdpCheckPayload,
  IdpParamsMapping,
  IdpPayload,
  IdpUnlinkPayload,
} from '../dto/idp-resource.dto';
import { Identity } from '../factories/idp-resource.builder';
import { IdpResourceService } from '../services/idp-resource.service';
import { IdpAuthService } from '../../auth/services/idp-auth.service';
import { IdpMapName } from '../../providers/idp/identity-provider.interface';
import { JwtAuthSession } from '../../auth/strategies/premature-auth.strategy';

/**
 * @dev Declare google user controller, handles Google related profile operations.
 */
@ApiTags('external')
@Controller('user/idp')
export class IdpController {
  constructor(
    private readonly idpResourceService: IdpResourceService,
    private readonly idpAuthService: IdpAuthService,
  ) {}

  /**
   * @dev Check for wallet availability
   * @param params
   * @param payload
   */
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Cannot verify identity.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Identity is verified',
  })
  @HttpCode(HttpStatus.OK)
  @Post('/:provider/identity/verify')
  public async verifyIdentity(
    @Param() params: IdpParamsMapping,
    @Body() payload: IdpPayload,
  ): Promise<Identity> {
    const result = this.idpResourceService.verifyIdentity(
      IdpMapName[params.provider],
      { base64Signature: payload.base64Signature },
    );

    /**
     * @dev Raise error if cannot verify Identity.
     */
    if (!result) {
      throw new UnprocessableEntityException('IDP::CANNOT_VERIFY_IDENTITY');
    }

    return result;
  }

  /**
   * @dev Check for wallet availability
   * @param params
   * @param payload
   */
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Identity was already existed.',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Identity is available',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/:provider/availability/check')
  public async checkAvailable(
    @Param() params: IdpParamsMapping,
    @Body() payload: IdpCheckPayload,
  ): Promise<void> {
    /**
     * @dev Call service to check availability
     */
    const result = await this.idpResourceService.checkAvailable(
      IdpMapName[params.provider],
      { identityId: payload.identityId },
    );

    /**
     * @dev Throw error if wallet already existed.
     */
    if (!result) {
      throw new ConflictException('IDP::IDENTITY_EXISTED');
    }
  }

  /**
   * @dev Link wallet
   */
  @CommonApiResponse(CommonResponse.WRONG_FIELD_FORMATS)
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Link identity provider successfully',
    type: TokenSetEntity,
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Cannot verify identity.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Identity already existed.',
  })
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put('/:provider/link')
  public link(
    @Request() req,
    @Param() params: IdpParamsMapping,
    @Body() payload: IdpPayload,
  ): Promise<void> {
    /**
     * @dev Extract user from request session.
     */
    const { user } = req.user as JwtAuthSession;

    /**
     * @dev Link Identity
     * - only return Unauthorized if error
     */
    return new UtilsProvider().overrideErrorWrap(
      async () =>
        this.idpResourceService.link(IdpMapName[params.provider], {
          userId: user.id,
          base64Signature: payload.base64Signature,
        }),
      {
        exceptionClass: UnauthorizedException,
      },
    );
  }

  /**
   * @dev Unlink Identity with email owned user
   */
  @CommonApiResponse(
    CommonResponse.UNAUTHORIZED_SESSION,
    CommonResponse.FORBIDDEN_SESSION,
  )
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Unlink Identity successfully',
  })
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put('/:provider/unlink')
  public unlink(
    @Request() req,
    @Param() params: IdpParamsMapping,
    @Body() payload: IdpUnlinkPayload,
  ): Promise<void> {
    /**
     * @dev Extract user from request session.
     */
    const { user } = req.user as JwtAuthSession;

    /**
     * @dev Unlink Identity.
     * - only return Unauthorized if error
     */
    return new UtilsProvider().overrideErrorWrap(
      async () => {
        /**
         * @dev Revoke all previous sessions first.
         */
        await this.idpAuthService.removeRelatedSessions(
          IdpMapName[params.provider],
          {
            userId: user.id,
            enabledIdpId: payload.enabledIdpId,
          },
        );

        /**
         * @dev Unlink identity.
         */
        await this.idpResourceService.unlink(IdpMapName[params.provider], {
          userId: user.id,
          enabledIdpId: payload.enabledIdpId,
        });
      },
      {
        exceptionClass: UnauthorizedException,
      },
    );
  }
}
