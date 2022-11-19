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

/**
 * @dev Declare user controller, handles profile operations.
 */
@ApiTags('user')
@ApiBearerAuth('jwt')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
  @SetMetadata('roles', [Role.MANAGE_ACCOUNT])
  @Patch('/profile')
  @HttpCode(HttpStatus.OK)
  public async updateUserProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    /**
     * @dev Extract user from request session.
     */
    const { token } = req.user as KeycloakAuthSession;

    /**
     * @dev Update profile and return updated profile.
     */
    return this.userService.updateUserProfile(token, updateUserDto);
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
     * @dev Extract user from request session.
     */
    const { token } = req.user as KeycloakAuthSession;

    /**
     * @dev Upload and update avatar, return updated profile.
     */
    return this.userService.uploadAvatar(token, files[0]);
  }
}
