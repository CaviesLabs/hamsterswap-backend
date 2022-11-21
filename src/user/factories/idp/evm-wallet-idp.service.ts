import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Repository } from 'typeorm';

/**
 * @dev Import logic deps
 */
import { EnabledIdpModel } from '../../../orm/model/enabled-idp.model';
import { AuthChallengeService } from '../../../auth/services/auth-challenge.service';
import {
  EVMSignatureData,
  EVMWalletIdentity,
  EVMWalletIdpProvider,
} from '../../../providers/idp/evm-wallet-idp.provider';
import { EVMWalletSignatureDto } from '../../dto/wallet-signature.dto';
import { IdpService } from '../idp-resource.builder';
import { AvailableIdpResourceName } from '../../../providers/idp/identity-provider.interface';

@Injectable()
export class EvmWalletIdpResourceService implements IdpService {
  constructor(
    /**
     * @dev Inject models
     */
    private readonly EnabledIdpRepo: Repository<EnabledIdpModel>,

    /**
     * @dev Inject services
     */
    private readonly authChallengeService: AuthChallengeService,
  ) {}

  /**
   * @dev Ensure identity must be unique.
   * @param walletAddress
   * @private
   */
  public async checkAvailable(walletAddress: string): Promise<boolean> {
    return !(await this.EnabledIdpRepo.findOne({
      where: { identityId: walletAddress },
    }));
  }

  /**
   * @dev Verify EVM wallet.
   * @paramx signature
   */
  public async verifyIdentity(
    signature: string,
  ): Promise<EVMWalletIdentity | null> {
    /**
     * @dev Decode base64 string
     */
    const decodedBase64 = Buffer.from(signature, 'base64').toString();
    const data: EVMSignatureData = JSON.parse(decodedBase64);

    /**
     * @dev Load into dto class, and validate schema.
     */
    const dto = plainToInstance(EVMWalletSignatureDto, data);
    const errors = validateSync(dto);

    /**
     * @dev Raise error if the config isn't valid
     */
    if (errors.length > 0) {
      throw new BadRequestException(
        JSON.stringify(errors.map((elm) => elm.constraints)),
      );
    }

    /**
     * @dev Load auth challenge message
     */
    const authChallenge =
      await this.authChallengeService.getLatestAuthChallenge(dto.desiredWallet);

    /**
     * @dev Use infra to verify identity.
     */
    const evmIdp = new EVMWalletIdpProvider();
    const result = evmIdp.verify({ ...dto, rawContent: authChallenge.memo });

    /**
     * @dev Resolve challenge if verification is ok.
     */
    if (result) {
      await this.authChallengeService.resolveAuthChallenge(authChallenge.id);
      return result;
    }

    /**
     * @dev Otherwise return null.
     */
    return null;
  }

  /**
   * @dev Verify EVM Idp
   * @param userId
   * @param signature
   */
  public async link(userId: string, signature: string): Promise<void> {
    /**
     * @dev Signature must be valid before further actions.
     */
    const verifiedWallet = await this.verifyIdentity(signature);
    if (!verifiedWallet) {
      throw new UnprocessableEntityException(
        'IDP::WALLET::WALLET_CANNOT_BE_VERIFIED',
      );
    }

    /**
     * @dev Check availability before link idp.
     */
    const isAvailable = await this.checkAvailable(verifiedWallet.identityId);
    if (!isAvailable) {
      /**
       * @dev Otherwise raise error
       */
      throw new ConflictException('IDP::WALLET::WALLET_EXISTED');
    }

    /**
     * @dev Create idp link for user.
     */
    await this.EnabledIdpRepo.create({
      userId,
      type: AvailableIdpResourceName.EVMWallet,
      identityId: verifiedWallet.identityId,
    });
  }

  /**
   * @dev Delete linked wallet.
   * @param userId
   * @param enabledIdpId
   */
  public async unlink(userId: string, enabledIdpId: string): Promise<void> {
    /**
     * @dev Raise error if wallet isn't enabled.
     */
    if (
      !(await this.EnabledIdpRepo.findOne({
        where: { userId, id: enabledIdpId },
      }))
    ) {
      throw new NotFoundException('IDP::WALLET::WALLET_NOT_FOUND');
    }

    /**
     * @dev Just delete record.
     */
    await this.EnabledIdpRepo.delete({
      userId,
      id: enabledIdpId,
    });
  }
}
