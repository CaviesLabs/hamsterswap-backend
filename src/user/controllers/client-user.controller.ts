import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Optional,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

/**
 * @dev Import other services
 */
import { UserService } from '../services/user.service';
import { UserEntity } from '../entities/user.entity';

/**
 * @dev Declare wallet controller.
 */
@ApiTags('client')
@ApiBearerAuth('jwt')
@Controller('client/user')
export class ClientUserController {
  /**
   * @dev Initialize Wallet controller.
   * @param userService
   */
  constructor(
    /**
     * @dev Import services
     */
    private readonly userService: UserService,
  ) {}

  /**
   * @dev Declare endpoint for get user profile by querying with wallet address or user id.
   * `userId` query is preferred.
   * @param userId
   */
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get user profile successfully',
    type: UserEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Session is not authorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "The session isn't valid, and get rejected.",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The requested resource is not found',
  })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @UseGuards(AuthGuard('jwt'))
  @Get('/')
  @HttpCode(HttpStatus.OK)
  public async queryUserByClient(
    @Query('userId') @Optional() userId?: string,
  ): Promise<UserEntity> {
    /**
     * @dev Get user by user id.
     */
    if (userId) {
      return this.userService.getUserProfileById(userId);
    }

    /**
     * @dev Raise bad request exception
     */
    throw new BadRequestException();
  }
}
