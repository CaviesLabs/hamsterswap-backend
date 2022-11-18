import { IsBase64, IsEnum, IsString } from 'class-validator';

import { IdpShortName } from '../../providers/idp/identity-provider.interface';

/**
 * @dev Define DTO for params.
 */
export class IdpParamsMapping {
  @IsEnum(IdpShortName)
  provider: string;
}

/**
 * @dev Define modify idp payload.
 */
export class IdpPayload {
  @IsBase64()
  base64Signature: string;
}

/**
 * @dev Define modify idp payload.
 */
export class IdpUnlinkPayload {
  @IsString()
  enabledIdpId: string;
}

/**
 * @dev Define Identity check payload
 */
export class IdpCheckPayload {
  @IsString()
  identityId: string;
}
