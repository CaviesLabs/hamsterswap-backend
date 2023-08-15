import {
  Controller,
  Get,
  Body,
  Patch,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
  UploadedFiles,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
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
import {
  GetUsersPublicProfileDto,
  UserProfileDto,
  UserPublicProfileDto,
} from '../dto/user-profile.dto';
import { AuthGuard } from '@nestjs/passport';

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
    type: UserProfileDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Session is not authorized',
  })
  @Get('/profile')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'))
  public async getUserProfile(
    @CurrentSession() { user }: JwtAuthSession,
  ): Promise<UserProfileDto> {
    const [idp] = await this.idpResourceService.listUserIdp(user.id);

    return {
      ...user,
      walletAddress: idp.identityId,
    };
  }

  /**
   * @dev Get user public profile by id.
   * @param id
   */
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get user profile successfully',
    type: UserPublicProfileDto,
  })
  @Get('/profile/:id')
  @HttpCode(HttpStatus.OK)
  public async getUserProfileById(
    @Param('id') id: string,
  ): Promise<UserPublicProfileDto> {
    const { avatar, telegram, twitter } =
      await this.userService.getUserProfileById(id);

    const [idp] = await this.idpResourceService.listUserIdp(id);

    const ordersStat = await this.userService.getUserStat(id);

    return {
      id,
      avatar,
      walletAddress: idp.identityId,
      telegram,
      twitter,
      ordersStat,
    };
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get user public profiles successfully',
    type: UserPublicProfileDto,
    isArray: true,
  })
  @Get('/profile/public')
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'))
  public getPublicProfileByIds(@Query() { ids }: GetUsersPublicProfileDto) {
    return this.userService.getUserProfileByIds(ids);
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
  @Patch('/profile')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'))
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
  @Post('/profile/avatar/upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FastifyFilesInterceptor('files', 1, {
      fileFilter: imageFileFilter,
    }),
  )
  @ApiBearerAuth('jwt')
  @UseGuards(AuthGuard('jwt'))
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
