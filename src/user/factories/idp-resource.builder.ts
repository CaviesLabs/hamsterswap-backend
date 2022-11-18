/**
 * @dev Define Application Interface for Identity Provider Service.
 */
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

/**
 * @dev Import logic deps
 */
import { AvailableIdpResourceName } from '../../providers/idp/identity-provider.interface';
import {
  EnabledIdpModel,
  EnabledIdpDocument,
} from '../../orm/model/enabled-idp.model';
import { AuthChallengeService } from '../../auth/services/auth-challenge.service';
import { EvmWalletIdpResourceService } from './idp/evm-wallet-idp.service';
import { GoogleIdpResourceService } from './idp/google-idp.service';

/**
 * @dev Define Identity interface
 */
export interface Identity {
  [x: string]: string;
  identityId: string;
}

/**
 * @dev Define Idp resource interface
 */
export interface IdpService {
  /**
   * @dev Verify identity based on the signature that was based64 encoded
   * @param base64Signature
   */
  verifyIdentity(base64Signature: string): Promise<Identity>;

  /**
   * @dev Check whether the identity is still available
   * @param identityId
   */
  checkAvailable(identityId: string): Promise<boolean>;

  /**
   * @dev Unlink identity provider from account.
   * @param userId
   * @param enabledIdpId
   */
  unlink(userId: string, enabledIdpId: string): Promise<void>;

  /**
   * @dev Link identity provider to account.
   * @param userId
   * @param signature
   */
  link(
    userId: string,
    signature: string | Record<string, string>,
  ): Promise<void>;
}

/**
 * @dev Injectable IDp builder
 */
@Injectable()
export class IdpResourceBuilder {
  constructor(
    /**
     * @dev Inject models
     */
    @InjectModel(EnabledIdpModel.name)
    private readonly EnabledIdpDocument: Model<EnabledIdpDocument>,

    /**
     * @dev Inject services
     */
    private readonly authChallengeService: AuthChallengeService,
  ) {}

  /**
   * @dev Get Idp resource based on type
   * @param type
   */
  public getIdpResource(type: AvailableIdpResourceName): IdpService {
    /**
     * @dev Switch and return provider accordingly.
     */
    switch (type) {
      case AvailableIdpResourceName.EVMWallet:
        return new EvmWalletIdpResourceService(
          this.EnabledIdpDocument,
          this.authChallengeService,
        );
      case AvailableIdpResourceName.Google:
        return new GoogleIdpResourceService(this.EnabledIdpDocument);
    }

    throw new UnprocessableEntityException('IDP::UNSUPPORTED_IDP');
  }
}
