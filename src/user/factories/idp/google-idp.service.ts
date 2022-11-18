import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Model } from 'mongoose';
import { EnabledIdpDocument } from '../../../orm/model/enabled-idp.model';
/**
 * @dev Import deps
 */
import {
  GoogleIdentity,
  GoogleIdpProvider,
} from '../../../providers/idp/google-idp.provider';
import { AvailableIdpResourceName } from '../../../providers/idp/identity-provider.interface';
import { GoogleSignatureDto } from '../../dto/google-signature.dto';
import { IdpService } from '../idp-resource.builder';

export class GoogleIdpResourceService implements IdpService {
  constructor(
    /**
     * @dev Inject models
     */
    private readonly EnabledIdpDocument: Model<EnabledIdpDocument>,
  ) {}

  async verifyIdentity(
    base64Signature: string,
  ): Promise<GoogleIdentity | null> {
    /**
     * @dev Decode base64 string
     */
    const decodedBase64 = Buffer.from(base64Signature, 'base64').toString();
    const data = JSON.parse(decodedBase64);

    /**
     * @dev Load into dto class, and validate schema
     */
    const dto = plainToInstance(GoogleSignatureDto, data);
    const errors = validateSync(dto);
    /**
     * @dev Raise error if the data isn't valid
     */
    if (errors.length > 0) {
      throw new BadRequestException(
        JSON.stringify(errors.map((err) => err.constraints)),
      );
    }

    /**
     * @dev Request to verify token
     */
    return new GoogleIdpProvider().verify(dto.accessToken);
  }

  async checkAvailable(identityId: string): Promise<boolean> {
    return !(await this.EnabledIdpDocument.exists({
      identityId,
    }).exec());
  }

  async link(userId: string, signature: string): Promise<void> {
    /**
     * @dev retrieve and check token info
     */
    const tokenInfo = await this.verifyIdentity(signature);
    if (!tokenInfo) {
      throw new BadRequestException('GOOGLE_USER::INVALID_TOKEN');
    }

    /**
     * @dev Check availability before link idp.
     */
    const isAvailable = await this.checkAvailable(tokenInfo.identityId);
    if (!isAvailable) {
      /**
       * @dev Otherwise raise error
       */
      throw new ConflictException('IDP::GOOGLE::ACCOUNT_LINKED');
    }

    /**
     * @dev Create idp link for user.
     */
    await this.EnabledIdpDocument.create({
      userId,
      type: AvailableIdpResourceName.Google,
      identityId: tokenInfo.identityId,
    });
  }

  async unlink(userId: string, enabledIdpId: string): Promise<void> {
    const enabledIdp = await this.EnabledIdpDocument.exists({
      userId,
      _id: enabledIdpId,
    });
    if (!enabledIdp) {
      throw new NotFoundException('IDP::GOOGLE::ACCOUNT_NOT_FOUND');
    }
    /**
     * @dev Delete the record
     */
    await this.EnabledIdpDocument.deleteOne({
      userId,
      _id: enabledIdpId,
    });
  }
}
