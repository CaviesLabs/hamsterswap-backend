import {
  Controller,
  Get,
  Body,
  Patch,
  HttpCode,
  HttpStatus,
  UseGuards,
  Post,
  UseInterceptors,
  UploadedFiles,
  Param,
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
import { UserEntity } from '../entities/user.entity';
import {
  FastifyFilesInterceptor,
  imageFileFilter,
} from '../../file.interceptor';
import { JwtAuthSession } from '../../auth/strategies/premature-auth.strategy';
import { CurrentSession } from '../../auth/decorators/current-session.decorator';
import { IdpResourceService } from '../services/idp-resource.service';
import { UserProfileDto } from '../dto/user-profile.dto';

/**
 * @dev Declare user controller, handles profile operations.
 */
@ApiTags('user')
@ApiBearerAuth('jwt')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly idpResourceService: IdpResourceService,
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
  @UseGuards(AuthGuard('jwt'))
  @Get('/profile')
  @HttpCode(HttpStatus.OK)
  public async getUserProfile(
    @CurrentSession() { user }: JwtAuthSession,
  ): Promise<UserProfileDto> {
    const [idp] = await this.idpResourceService.listUserIdp(user.id);
    return {
      id: user.id,
      avatar: user.avatar,
      walletAddress: idp.identityId,
    };
  }

  /**
   * @dev Get user public profile by id.
   * @param req
   */
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get user profile successfully',
    type: UserEntity,
  })
  @Get('/profile/:id')
  @HttpCode(HttpStatus.OK)
  public async getUserProfileById(
    @Param('id') id: string,
  ): Promise<UserProfileDto> {
    const { avatar } = await this.userService.getUserProfileById(id);
    const [idp] = await this.idpResourceService.listUserIdp(id);
    return {
      id,
      avatar,
      walletAddress: idp.identityId,
    };
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
  @UseGuards(AuthGuard('jwt'))
  @Patch('/profile')
  @HttpCode(HttpStatus.OK)
  public async updateUserProfile(
    @CurrentSession() { user }: JwtAuthSession,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    /**
     * @dev Update profile and return updated profile.
     */
    return this.userService.updateUserProfile(user.id, updateUserDto);
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
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseGuards(AuthGuard('jwt'))
  @Post('/profile/avatar/upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FastifyFilesInterceptor('files', 1, {
      fileFilter: imageFileFilter,
    }),
  )
  public async upload(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentSession() { user }: JwtAuthSession,
  ) {
    /**
     * @dev Upload and update avatar, return updated profile.
     */
    return this.userService.uploadAvatar(user.id, files[0]);
  }
}
