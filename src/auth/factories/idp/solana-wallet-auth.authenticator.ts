import { ConflictException, NotFoundException } from '@nestjs/common';

/**
 * @dev Import logic deps
 */
import { IdpAuthenticator } from '../idp-auth.builder';
import { ExtendedSessionModel } from '../../../orm/model/extended-session.model';
import { TokenIssuerService } from '../../services/token-issuer.service';
import { UserService } from '../../../user/services/user.service';
import { AuthSessionService } from '../../services/auth-session.service';
import { TokenSetEntity } from '../../entities/token-set.entity';
import { AvailableIdpResourceName } from '../../../providers/idp/identity-provider.interface';
import { IdpService } from '../../../user/factories/idp-resource.builder';
import { EnabledIdpModel } from '../../../orm/model/enabled-idp.model';
import { Repository } from 'typeorm';
import { Role } from '../../../user/entities/user.entity';

export class SolanaWalletAuthenticator implements IdpAuthenticator {
  constructor(
    /**
     * @dev Inject models.
     */
    private readonly EnabledIdpRepo: Repository<EnabledIdpModel>,
    private readonly ExtendedSessionRepo: Repository<ExtendedSessionModel>,

    /**
     * @dev Inject services
     */
    private readonly solanaWalletIdp: IdpService,
    private readonly tokenIssuer: TokenIssuerService,
    private readonly userService: UserService,
    private readonly sessionService: AuthSessionService,
  ) {}

  /**
   * @dev Verify Identity.
   * @param identityId
   * @private
   */
  private async validateIdentity(identityId: string): Promise<EnabledIdpModel> {
    const idpDoc = await this.EnabledIdpRepo.findOne({
      where: {
        identityId,
      },
    });

    /**
     * @dev If idp is not enabled, raise error
     */
    if (!idpDoc) {
      throw new NotFoundException('ACCOUNT::IDENTITY_NOT_ENABLED');
    }

    /**
     * @dev Return Idp
     */
    return idpDoc;
  }

  /**
   * @dev Signin with evm wallet.
   * @param signatureData
   */
  public async signIn(signatureData: string): Promise<TokenSetEntity> {
    /**
     * @dev Signature must be valid before further actions.
     */
    const verifiedWallet = await this.solanaWalletIdp.verifyIdentity(
      signatureData,
    );

    /**
     * @dev Verify wallet identity
     */
    const identity = await this.validateIdentity(verifiedWallet.identityId);

    /**
     * @dev Now grant access token if user
     */
    return this.tokenIssuer.grantSignInAccessToken({
      actorId: identity.userId,
    });
  }

  /**
   * @dev Signup with wallet.
   * @param signatureData
   */
  public async signUp(signatureData: string): Promise<TokenSetEntity> {
    /**
     * @dev Signature must be valid before further actions.
     */
    const verifiedWallet = await this.solanaWalletIdp.verifyIdentity(
      signatureData,
    );

    /**
     * @dev Wallet must be available.
     */
    const identityAvailable = await this.solanaWalletIdp.checkAvailable(
      verifiedWallet.identityId,
    );
    if (!identityAvailable) {
      throw new ConflictException('IDP::IDENTITY_EXISTED');
    }

    /**
     * @dev Create empty user.
     */
    const user = await this.userService.createUser({
      roles: [Role.User],
    });

    /**
     * @dev Now link wallet
     */
    await this.EnabledIdpRepo.save({
      userId: user.id,
      type: AvailableIdpResourceName.SolanaWallet,
      identityId: verifiedWallet.identityId,
    });

    /**
     * @dev Then return access token
     */
    return this.tokenIssuer.grantSignInAccessToken({ actorId: user.id });
  }

  /**
   * @dev Logout session.
   * @param userId
   * @param enabledIdpId
   */
  public async removeRelatedSessions(userId: string, enabledIdpId: string) {
    /**
     * @dev Find all related sessions
     */
    const sessions = await this.ExtendedSessionRepo.find({
      where: {
        userId,
        enabledIdpId: `${AvailableIdpResourceName.SolanaWallet}-${enabledIdpId}`,
      },
    });

    /**
     * @dev Then delete.
     */
    for (const session of sessions) {
      await this.sessionService.endSession(userId, session.sessionOrigin);
    }
  }
}
