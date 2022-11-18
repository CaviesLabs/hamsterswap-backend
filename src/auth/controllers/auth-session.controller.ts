import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Request,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

/**
 * @dev Import deps
 */
import {
  KeycloakAuthSession,
  KeycloakAuthStrategy,
} from '../strategies/keycloak-auth.strategy';
import {
  KeycloakAccountResourceAccessRolesGuard,
  Role,
} from '../guards/keycloak-account-resource-access-roles.guard';
import { AuditLoggerContextMap } from '../../audit/audit-logger.service';
import { EventType } from '../../audit/entities/trail.entity';
import { AuthSessionService } from '../services/auth-session.service';
import { ExtendedSessionDocument } from '../../orm/model/extended-session.model';
import { ExtendedSessionEntity } from '../entities/extended-session.entity';

/**
 * @dev Define sessions controller.
 */
@Controller('auth/sessions/')
@ApiTags('sessions')
export class AuthSessionController {
  /**
   * @dev Constructor that initializes AuthController.s
   * @param sessionService
   * @param auditLoggerContextMap
   */
  constructor(
    private readonly sessionService: AuthSessionService,
    private readonly auditLoggerContextMap: AuditLoggerContextMap,
  ) {}

  /**
   * @dev Remove a sessions
   * @param req
   * @param extendedSessionId
   */
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Session is removed successfully.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "The session isn't valid, and get rejected.",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "The session isn't valid, and get rejected.",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session is not found.',
  })
  @ApiBearerAuth('jwt')
  @UseGuards(
    AuthGuard(KeycloakAuthStrategy.key),
    KeycloakAccountResourceAccessRolesGuard,
  )
  @SetMetadata('roles', [Role.MANAGE_ACCOUNT])
  @SetMetadata(EventType, EventType.SESSION_REMOVE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:id')
  public async endSession(
    @Request() req,
    @Param('id') extendedSessionId: string,
  ): Promise<void> {
    /**
     * @dev get audit logger instance
     */
    const auditLogger = this.auditLoggerContextMap.getOrCreate(req.id);

    /**
     * @dev Extract session.
     */
    const { user } = req.user as KeycloakAuthSession;

    /**
     * @dev Get result.
     */
    const result = await this.sessionService.endSession(
      user.sub,
      extendedSessionId,
    );

    /**
     * @dev Push audit event
     */
    await auditLogger.log({ eventName: 'Ended session successfully' });

    /**
     * @dev Return response
     */
    return result;
  }

  /**
   * @dev List sessions.
   * @param req
   */
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List sessions successfully.',
    type: [ExtendedSessionEntity],
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "The session isn't valid, and get rejected.",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "The session isn't valid, and get rejected.",
  })
  @ApiBearerAuth('jwt')
  @UseGuards(
    AuthGuard(KeycloakAuthStrategy.key),
    KeycloakAccountResourceAccessRolesGuard,
  )
  @SetMetadata('roles', [Role.MANAGE_ACCOUNT])
  @HttpCode(HttpStatus.OK)
  @Get('/')
  public async listExtendedSessions(
    @Request() req,
  ): Promise<ExtendedSessionDocument[]> {
    /**
     * @dev Extract session.
     */
    const { user } = req.user as KeycloakAuthSession;

    /**
     * @dev Get result.
     */
    return this.sessionService.listUserExtendedSession(user.sub);
  }
}
