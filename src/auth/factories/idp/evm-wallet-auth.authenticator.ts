import { Model } from 'mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';

/**
 * @dev Import logic deps
 */
import { IdpAuthenticator } from '../idp-auth.builder';
import { EnabledIdpDocument } from '../../../orm/model/enabled-idp.model';
import { ExtendedSessionDocument } from '../../../orm/model/extended-session.model';
import { TokenIssuerService } from '../../services/token-issuer.service';
import { UserService } from '../../../user/services/user.service';
import { AuthSessionService } from '../../services/auth-session.service';
import { TokenSetEntity } from '../../entities/token-set.entity';
import { AvailableIdpResourceName } from '../../../providers/idp/identity-provider.interface';
import { IdpService } from '../../../user/factories/idp-resource.builder';

export class EvmWalletAuthenticator implements IdpAuthenticator {
  constructor(
    /**
     * @dev Inject models.
     */
    private readonly EnabledIdpDocument: Model<EnabledIdpDocument>,
    private readonly ExtendedSessionDocument: Model<ExtendedSessionDocument>,

    /**
     * @dev Inject services
     */
    private readonly evmWalletIdp: IdpService,
    private readonly tokenIssuer: TokenIssuerService,
    private readonly userService: UserService,
    private readonly sessionService: AuthSessionService,
  ) {}

  /**
   * @dev Verify Identity.
   * @param identityId
   * @private
   */
  private async validateIdentity(
    identityId: string,
  ): Promise<EnabledIdpDocument> {
    const idpDoc = await this.EnabledIdpDocument.findOne({
      identityId,
    }).exec();

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
    const verifiedWallet = await this.evmWalletIdp.verifyIdentity(
      signatureData,
    );

    /**
     * @dev Verify wallet identity
     */
    const identity = await this.validateIdentity(verifiedWallet.identityId);

    /**
     * @dev Return premature access token.
     */
    if (!(await this.userService.didUserVerifyEmail(identity.userId))) {
      return {
        access_token: await this.tokenIssuer.grantVerifyEmailAccessToken({
          actorId: identity.userId,
        }),
      };
    }

    /**
     * @dev Now grant access token if user
     */
    return this.tokenIssuer.grantImpersonatingKeycloakAccessToken({
      keycloakUserId: identity.userId,
      enabledIdpId: identity._id,
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
    const verifiedWallet = await this.evmWalletIdp.verifyIdentity(
      signatureData,
    );

    /**
     * @dev Wallet must be available.
     */
    const identityAvailable = await this.evmWalletIdp.checkAvailable(
      verifiedWallet.identityId,
    );
    if (!identityAvailable) {
      throw new ConflictException('IDP::IDENTITY_EXISTED');
    }

    /**
     * @dev Create empty user.
     */
    const user = await this.userService.createUser({});

    /**
     * @dev Now link wallet
     */
    const enabledIdp = await this.EnabledIdpDocument.create({
      userId: user.id,
      type: AvailableIdpResourceName.EVMWallet,
      identityId: verifiedWallet.identityId,
    });

    /**
     * @dev Then return access token
     */
    return {
      access_token: await this.tokenIssuer.grantVerifyEmailAccessToken({
        actorId: user.id,
        enabledIdpId: enabledIdp._id,
      }),
    };
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
    const sessions = await this.ExtendedSessionDocument.find({
      userId,
      enabledIdpId: `${AvailableIdpResourceName.EVMWallet}-${enabledIdpId}`,
    });

    /**
     * @dev Then delete.
     */
    for (const session of sessions) {
      await this.sessionService.endSession(userId, session.sessionOrigin);
    }
  }
}
