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
  SetMetadata,
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
import { AuditLoggerContextMap } from '../../audit/audit-logger.service';
import { EventType } from '../../audit/entities/trail.entity';
import { TokenSetEntity } from '../../auth/entities/token-set.entity';
import {
  KeycloakAccountResourceAccessRolesGuard,
  Role,
} from '../../auth/guards/keycloak-account-resource-access-roles.guard';
import {
  KeycloakAuthSession,
  KeycloakAuthStrategy,
} from '../../auth/strategies/keycloak-auth.strategy';
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

/**
 * @dev Declare google user controller, handles Google related profile operations.
 */
@ApiTags('external')
@Controller('user/idp')
export class IdpController {
  constructor(
    private readonly idpResourceService: IdpResourceService,
    private readonly idpAuthService: IdpAuthService,
    private readonly auditLoggerContextMap: AuditLoggerContextMap,
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
  @UseGuards(
    AuthGuard(KeycloakAuthStrategy.key),
    KeycloakAccountResourceAccessRolesGuard,
  )
  @SetMetadata(EventType, EventType.IDP_LINK)
  @SetMetadata('roles', [Role.MANAGE_ACCOUNT])
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
    const { user } = req.user as KeycloakAuthSession;

    /**
     * @dev get audit logger instance
     */
    const auditLogger = this.auditLoggerContextMap.getOrCreate(req.id);

    /**
     * @dev Link Identity
     * - only return Unauthorized if error
     */
    return new UtilsProvider().overrideErrorWrap(
      async () => {
        await this.idpResourceService.link(IdpMapName[params.provider], {
          userId: user.sub,
          base64Signature: payload.base64Signature,
        });

        /**
         * @dev Push audit event
         */
        await auditLogger.log({
          eventName: 'Link Identity succeeded',
          additionalEventData: {
            provider: IdpMapName[params.provider],
          },
        });
      },
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
  @UseGuards(
    AuthGuard(KeycloakAuthStrategy.key),
    KeycloakAccountResourceAccessRolesGuard,
  )
  @SetMetadata(EventType, EventType.IDP_UNLINK)
  @SetMetadata('roles', [Role.MANAGE_ACCOUNT])
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put('/:provider/unlink')
  public unlink(
    @Request() req,
    @Param() params: IdpParamsMapping,
    @Body() payload: IdpUnlinkPayload,
  ): Promise<void> {
    /**
     * @dev get audit logger instance
     */
    const auditLogger = this.auditLoggerContextMap.getOrCreate(req.id);

    /**
     * @dev Extract user from request session.
     */
    const { user } = req.user as KeycloakAuthSession;

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
            userId: user.sub,
            enabledIdpId: payload.enabledIdpId,
          },
        );

        /**
         * @dev Unlink identity.
         */
        await this.idpResourceService.unlink(IdpMapName[params.provider], {
          userId: user.sub,
          enabledIdpId: payload.enabledIdpId,
        });

        /**
         * @dev Push audit event
         */
        await auditLogger.log({
          eventName: 'Unlink Identity succeeded',
          additionalEventData: { provider: IdpMapName[params.provider] },
        });
      },
      {
        exceptionClass: UnauthorizedException,
      },
    );
  }
}
