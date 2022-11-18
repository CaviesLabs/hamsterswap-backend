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

import { TokenSetEntity } from '../entities/token-set.entity';
import { KeycloakAuthSession } from '../strategies/keycloak-auth.strategy';
import {
  KeycloakAccountResourceAccessRolesGuard,
  Role,
} from '../guards/keycloak-account-resource-access-roles.guard';
import { RequestWalletPermissionDto } from '../dto/request-wallet-permission.dto';
import { KeycloakClientAuthStrategy } from '../strategies/keycloak-client-auth.strategy';
import {
  KeycloakAuthorizationPermissionScopeGuard,
  WalletScope,
} from '../guards/keycloak-authorization-permission-scope.guard';
import { PermissionService } from '../services/permission.service';

/**
 * @dev Hamsterbox Auth controller.
 */
@Controller('client/auth')
@ApiTags('client')
export class ClientAuthController {
  /**
   * @dev Constructor that initializes AuthController.s
   * @param authService
   * @param permissionService
   * @param tokenIssuerService
   */
  constructor(private readonly permissionService: PermissionService) {}

  /**
   * @dev Request an exchange code.
   * @param req
   * @param requestWalletPermissionDto
   */
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Request wallet permission.',
    type: TokenSetEntity,
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
    AuthGuard(KeycloakClientAuthStrategy.key),
    KeycloakAccountResourceAccessRolesGuard,
  )
  @SetMetadata('roles', [Role.MANAGE_ACCOUNT])
  @HttpCode(HttpStatus.CREATED)
  @Post('/permission/wallet/request')
  public async requestClientWalletPermission(
    @Request() req,
    @Body() requestWalletPermissionDto: RequestWalletPermissionDto,
  ): Promise<TokenSetEntity> {
    /**
     * @dev Extract session.
     */
    const { token } = req.user as KeycloakAuthSession;

    /**
     * @dev Return code response.
     */
    return this.permissionService.requestWalletPermission(
      token,
      requestWalletPermissionDto.walletScope,
    );
  }

  /**
   * @dev Evaluate `wallet:read` permission.
   */
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Request wallet permission.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
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
  @ApiBearerAuth('jwt')
  @UseGuards(
    AuthGuard(KeycloakClientAuthStrategy.key),
    KeycloakAccountResourceAccessRolesGuard,
    KeycloakAuthorizationPermissionScopeGuard,
  )
  @SetMetadata('roles', [Role.MANAGE_ACCOUNT])
  @SetMetadata('scopes', [WalletScope.WALLET_READ, WalletScope.WALLET_WRITE])
  @HttpCode(HttpStatus.OK)
  @Post('/permission/wallet/evaluate/read')
  public async evaluateWalletRead(): Promise<{ status: string }> {
    return {
      status: 'PERMITTED',
    };
  }

  /**
   * @dev Evaluate `wallet:write` permission.
   */
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Request wallet permission.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
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
  @ApiBearerAuth('jwt')
  @UseGuards(
    AuthGuard(KeycloakClientAuthStrategy.key),
    KeycloakAccountResourceAccessRolesGuard,
    KeycloakAuthorizationPermissionScopeGuard,
  )
  @SetMetadata('roles', [Role.MANAGE_ACCOUNT])
  @SetMetadata('scopes', [WalletScope.WALLET_WRITE])
  @HttpCode(HttpStatus.OK)
  @Post('/permission/wallet/evaluate/write')
  public async evaluateWalletWrite(): Promise<{ status: string }> {
    return {
      status: 'PERMITTED',
    };
  }
}
