import { IsEnum, IsString } from 'class-validator';

import { WalletScope } from '../guards/keycloak-authorization-permission-scope.guard';

export class RequestWalletPermissionDto {
  @IsEnum(WalletScope)
  @IsString()
  walletScope: WalletScope;
}
