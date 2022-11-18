import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

/**
 * @dev Import logic deps
 */
import {
  EnabledIdpModel,
  EnabledIdpDocument,
} from '../../orm/model/enabled-idp.model';
import { AvailableIdpResourceName } from '../../providers/idp/identity-provider.interface';
import {
  Identity,
  IdpResourceBuilder,
} from '../factories/idp-resource.builder';

/**
 * @dev Define IDP link payload
 */
export interface IdpLinkPayload {
  userId: string;
  base64Signature: string;
}

/**
 * @dev Define Idp Unlink payload
 */
export interface IdpUnlinkPayload {
  userId: string;
  enabledIdpId: string;
}

/**
 * @dev Define Idp verify payload
 */
export interface IdpVerifyPayload {
  base64Signature: string;
}

/**
 * @dev Define Idp check available payload
 */
export interface IdpCheckAvailablePayload {
  identityId: string;
}

@Injectable()
export class IdpResourceService {
  constructor(
    /**
     * @dev Inject models
     */
    @InjectModel(EnabledIdpModel.name)
    private readonly EnabledIdpDocument: Model<EnabledIdpDocument>,

    /**
     * @dev Inject builders
     */
    private readonly idpResourceBuilder: IdpResourceBuilder,
  ) {}

  /**
   * @dev List all idp that user has.
   * @param userId
   */
  public async listUserIdp(userId: string): Promise<EnabledIdpDocument[]> {
    return this.EnabledIdpDocument.find({
      userId,
    });
  }

  /**
   * @dev Link idp provider to account
   * @param type
   * @param payload
   */
  public link(
    type: AvailableIdpResourceName,
    payload: IdpLinkPayload,
  ): Promise<void> {
    return this.idpResourceBuilder
      .getIdpResource(type)
      .link(payload.userId, payload.base64Signature);
  }

  /**
   * @dev Unlink idp provider from account
   * @param type
   * @param payload
   */
  public unlink(
    type: AvailableIdpResourceName,
    payload: IdpUnlinkPayload,
  ): Promise<void> {
    return this.idpResourceBuilder
      .getIdpResource(type)
      .unlink(payload.userId, payload.enabledIdpId);
  }

  /**
   * @dev Verify identity
   * @param type
   * @param payload
   */
  public verifyIdentity(
    type: AvailableIdpResourceName,
    payload: IdpVerifyPayload,
  ): Promise<Identity> {
    return this.idpResourceBuilder
      .getIdpResource(type)
      .verifyIdentity(payload.base64Signature);
  }

  /**
   * @dev Check identity availability
   * @param type
   * @param payload
   */
  public checkAvailable(
    type: AvailableIdpResourceName,
    payload: IdpCheckAvailablePayload,
  ): Promise<boolean> {
    return this.idpResourceBuilder
      .getIdpResource(type)
      .checkAvailable(payload.identityId);
  }
}
