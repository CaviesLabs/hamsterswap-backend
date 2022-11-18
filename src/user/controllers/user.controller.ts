import {
  Controller,
  Get,
  Body,
  Patch,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Post,
  UseInterceptors,
  UploadedFiles,
  SetMetadata,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

/**
 * @dev Import logic deps
 */
import { UserService } from '../services/user.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import {
  KeycloakAuthSession,
  KeycloakAuthStrategy,
} from '../../auth/strategies/keycloak-auth.strategy';
import { UserEntity } from '../entities/user.entity';
import {
  FastifyFilesInterceptor,
  imageFileFilter,
} from '../../file.interceptor';
import {
  KeycloakAccountResourceAccessRolesGuard,
  Role,
} from '../../auth/guards/keycloak-account-resource-access-roles.guard';
import { AuditLoggerContextMap } from '../../audit/audit-logger.service';
import { EventType } from '../../audit/entities/trail.entity';

/**
 * @dev Declare user controller, handles profile operations.
 */
@ApiTags('user')
@ApiBearerAuth('jwt')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    /**
     * @dev inject audit logger
     */
    private readonly auditLoggerContextMap: AuditLoggerContextMap,
  ) {}

  /**
   * @dev Declare endpoint for getting profile.
   * @param req
   */
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get user profile successfully',
    type: UserEntity,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Session is not authorized',
  })
  @UseGuards(
    AuthGuard(KeycloakAuthStrategy.key),
    KeycloakAccountResourceAccessRolesGuard,
  )
  @SetMetadata('roles', [Role.VIEW_PROFILE])
  @Get('/profile')
  @HttpCode(HttpStatus.OK)
  public getUserProfile(@Request() req) {
    /**
     * @dev Extract and return user from request session.
     */
    const { user } = req.user as KeycloakAuthSession;
    return user;
  }

  /**
   * @dev Declare endpoint for updating profile
   * @param req
   * @param updateUserDto
   */
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Update user profile successfully',
    type: UserEntity,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Session is not authorized',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Wrong fields' formats.",
  })
  @UseGuards(
    AuthGuard(KeycloakAuthStrategy.key),
    KeycloakAccountResourceAccessRolesGuard,
  )
  @SetMetadata(EventType, EventType.ACCOUNT_UPDATE_PROFILE)
  @SetMetadata('roles', [Role.MANAGE_ACCOUNT])
  @Patch('/profile')
  @HttpCode(HttpStatus.OK)
  public async updateUserProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    /**
     * @dev get audit logger instance
     */
    const auditLogger = this.auditLoggerContextMap.getOrCreate(req.id);
    /**
     * @dev Extract user from request session.
     */
    const { token } = req.user as KeycloakAuthSession;

    /**
     * @dev Update profile and return updated profile.
     */
    return this.userService
      .updateUserProfile(token, updateUserDto)
      .then(async (r) => {
        /**
         * @dev Log actions
         */
        await auditLogger.log({
          eventName: 'Update profile succeeded',
          additionalEventData: {
            requestPayload: updateUserDto,
          },
        });

        return r;
      });
  }

  /**
   * @dev Upload and update user avatar.
   * @param files
   * @param req
   */
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Update user profile successfully',
    type: UserEntity,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Session is not authorized',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Wrong fields' formats.",
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          // 👈 this property
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseGuards(
    AuthGuard(KeycloakAuthStrategy.key),
    KeycloakAccountResourceAccessRolesGuard,
  )
  @SetMetadata('roles', [Role.MANAGE_ACCOUNT])
  @SetMetadata(EventType, EventType.ACCOUNT_UPDATE_AVATAR)
  @Post('/profile/avatar/upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FastifyFilesInterceptor('files', 1, {
      fileFilter: imageFileFilter,
    }),
  )
  public async upload(
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    /**
     * @dev get audit logger instance
     */
    const auditLogger = this.auditLoggerContextMap.getOrCreate(req.id);

    /**
     * @dev Extract user from request session.
     */
    const { token } = req.user as KeycloakAuthSession;

    /**
     * @dev Upload and update avatar, return updated profile.
     */
    return this.userService.uploadAvatar(token, files[0]).then(async (r) => {
      /**
       * @dev Log actions
       */
      await auditLogger.log({
        eventName: 'Update avatar succeeded',
      });

      return r;
    });
  }
}
