import { Injectable } from '@nestjs/common';

/**
 * @dev import logic deps
 */
import { IdpAuthBuilder } from '../factories/idp-auth.builder';
import { IdpSignInPayload, IdpSignUpPayload } from '../dto/idp-auth.dto';
import { TokenSetEntity } from '../entities/token-set.entity';
import { AvailableIdpResourceName } from '../../providers/idp/identity-provider.interface';

/**
 * @dev Define payload for remote related sessions.
 */
export interface RemoveRelatedSessionsPayload {
  userId: string;
  enabledIdpId: string;
}

/**
 * @dev Define IdpAuthService
 */
@Injectable()
export class IdpAuthService {
  constructor(private readonly idpAuthBuilder: IdpAuthBuilder) {}

  /**
   * @dev Sign in
   * @param type
   * @param signInPayload
   */
  public signIn(
    type: AvailableIdpResourceName,
    signInPayload: IdpSignInPayload,
  ): Promise<TokenSetEntity> {
    return this.idpAuthBuilder
      .getIdpAuthService(type)
      .signIn(signInPayload.base64Signature);
  }

  /**
   * @dev Sign up
   * @param type
   * @param signUpPayload
   */
  public signUp(
    type: AvailableIdpResourceName,
    signUpPayload: IdpSignUpPayload,
  ): Promise<TokenSetEntity> {
    return this.idpAuthBuilder
      .getIdpAuthService(type)
      .signUp(signUpPayload.base64Signature);
  }

  /**
   * @dev Clean up related sessions.
   * @param type
   * @param payload
   */
  public removeRelatedSessions(
    type: AvailableIdpResourceName,
    payload: RemoveRelatedSessionsPayload,
  ): Promise<void> {
    return this.idpAuthBuilder
      .getIdpAuthService(type)
      .removeRelatedSessions(payload.userId, payload.enabledIdpId);
  }
}
