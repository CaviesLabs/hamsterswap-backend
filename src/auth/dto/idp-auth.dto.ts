import { IsBase64 } from 'class-validator';

/**
 * @dev Define IDP Signin payload
 */
export class IdpSignInPayload {
  @IsBase64()
  base64Signature: string;
}

/**
 * @dev Define Idp Signup payload
 */
export class IdpSignUpPayload {
  @IsBase64()
  base64Signature: string;
}
