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

import { AuthSessionService } from '../services/auth-session.service';
import { ExtendedSessionEntity } from '../entities/extended-session.entity';
import { ExtendedSessionModel } from '../../orm/model/extended-session.model';
import { JwtAuthSession } from '../strategies/premature-auth.strategy';
import { RestrictScopeGuard } from '../guards/restrict-scope.guard';
import { AuthScope } from '../entities/auth-session.entity';

/**
 * @dev Define sessions controller.
 */
@Controller('auth/sessions/')
@ApiTags('sessions')
@UseGuards(AuthGuard('jwt'), RestrictScopeGuard)
export class AuthSessionController {
  /**
   * @dev Constructor that initializes AuthController.s
   * @param sessionService
   */
  constructor(private readonly sessionService: AuthSessionService) {}

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
  @UseGuards(AuthGuard('jwt'))
  @SetMetadata('scopes', [AuthScope.WriteProfile])
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:id')
  public async endSession(
    @Request() req,
    @Param('id') extendedSessionId: string,
  ): Promise<void> {
    /**
     * @dev Extract session.
     */
    const { user } = req.user as JwtAuthSession;

    /**
     * @dev Get result.
     */
    const result = await this.sessionService.endSession(
      user.id,
      extendedSessionId,
    );

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
  @UseGuards(AuthGuard('jwt'))
  @SetMetadata('scopes', [AuthScope.ReadProfile])
  @HttpCode(HttpStatus.OK)
  @Get('/')
  public async listExtendedSessions(
    @Request() req,
  ): Promise<ExtendedSessionModel[]> {
    /**
     * @dev Extract session.
     */
    const { user } = req.user as JwtAuthSession;

    /**
     * @dev Get result.
     */
    return this.sessionService.listUserExtendedSession(user.id);
  }
}
