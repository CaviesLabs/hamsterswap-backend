import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
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
import { ConfirmTwoFactorsDto } from '../dto/2fa-confirm.dto';
import { TwoFactorsService } from '../services/two-factor.service';

/**
 * @dev Hamsterbox 2Factor Auth controller.
 */
@Controller('auth/two-factors')
@ApiTags('2fa')
export class TwoFactorsController {
  /**
   * @dev Constructor that initializes AuthController.s
   * @param authService
   * @param twoFactorsService
   */
  constructor(private readonly twoFactorsService: TwoFactorsService) {}

  /**
   * @dev Request 2 factors code.
   * @param req
   */
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Request two factors code',
    schema: {
      type: 'object',
      properties: {
        secret: {
          type: 'string',
        },
        base64QrCode: {
          type: 'string',
        },
      },
    },
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
    status: HttpStatus.CONFLICT,
    description: 'A 2FA was already confirmed. Cannot request OTP again.',
  })
  @ApiBearerAuth('jwt')
  @UseGuards(
    AuthGuard(KeycloakAuthStrategy.key),
    KeycloakAccountResourceAccessRolesGuard,
  )
  @SetMetadata('roles', [Role.MANAGE_ACCOUNT])
  @HttpCode(HttpStatus.CREATED)
  @Post('/request')
  public async request2FA(
    @Request() req,
  ): Promise<{ secret: string; base64QrCode: string }> {
    /**
     * @dev Extract session.
     */
    const { user } = req.user as KeycloakAuthSession;

    /**
     * @dev Get result.
     */
    const result = await this.twoFactorsService.request2FA(user);

    /**
     * @dev Return response
     */
    return result;
  }

  /**
   * @dev Request an exchange code.
   * @param req
   * @param confirmTwoFactorsDto
   */
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Confirm 2 factors successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "The session isn't valid, and get rejected.",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'The otp might be invalid.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User already confirmed the OTP.',
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/confirm')
  public async confirm2FA(
    @Request() req,
    @Body() confirmTwoFactorsDto: ConfirmTwoFactorsDto,
  ): Promise<void> {
    /**
     * @dev Extract session.
     */
    const { user } = req.user as KeycloakAuthSession;

    /**
     * @dev Get result.
     */
    const result = await this.twoFactorsService.confirm2FAEnabled(
      user.sub,
      confirmTwoFactorsDto.token,
    );

    /**
     * @dev Return response
     */
    return result;
  }
}
