import { ConflictException, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
/**
 * @dev Import deps
 */
import { EnabledIdpDocument } from '../../../orm/model/enabled-idp.model';
import { ExtendedSessionDocument } from '../../../orm/model/extended-session.model';
import { KeycloakAdminProvider } from '../../../providers/federated-users/keycloak-admin.provider';
import { AvailableIdpResourceName } from '../../../providers/idp/identity-provider.interface';
import { IdpService } from '../../../user/factories/idp-resource.builder';
import { UserService } from '../../../user/services/user.service';
import { TokenSetEntity } from '../../entities/token-set.entity';
import { AuthSessionService } from '../../services/auth-session.service';
import { TokenIssuerService } from '../../services/token-issuer.service';
import { IdpAuthenticator } from '../idp-auth.builder';

export class GoogleAuthenticator implements IdpAuthenticator {
  constructor(
    /**
     * @dev Inject models.
     */
    private readonly EnabledIdpDocument: Model<EnabledIdpDocument>,
    private readonly ExtendedSessionDocument: Model<ExtendedSessionDocument>,

    /**
     * @dev Inject providers
     */
    private readonly keycloakAdmin: KeycloakAdminProvider,

    /**
     * @dev Inject services
     */
    private readonly googleIdp: IdpService,
    private readonly tokenIssuer: TokenIssuerService,
    private readonly sessionService: AuthSessionService,
    private readonly userService: UserService,
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
     * @dev If user cannot be found, raise error
     */
    const user = await this.keycloakAdmin.instance.users.findOne({
      id: idpDoc.userId,
    });
    if (!user) {
      throw new NotFoundException('ACCOUNT::ACCOUNT_NOT_FOUND');
    }

    /**
     * @dev Return Idp
     */
    return idpDoc;
  }

  public async signIn(base64Signature: string): Promise<TokenSetEntity> {
    /**
     * @dev Signature must be valid before further actions.
     */
    const verifiedTokenData = await this.googleIdp.verifyIdentity(
      base64Signature,
    );

    /**
     * @dev Verify account identity
     */
    const identity = await this.validateIdentity(verifiedTokenData.identityId);

    /**
     * @dev Grant access token
     */
    return this.tokenIssuer.grantImpersonatingKeycloakAccessToken({
      keycloakUserId: identity.userId,
      enabledIdpId: identity._id,
    });
  }

  public async signUp(base64Signature: string): Promise<TokenSetEntity> {
    /**
     * @dev Signature must be valid before further actions.
     */
    const verifiedTokenData = await this.googleIdp.verifyIdentity(
      base64Signature,
    );

    /**
     * @dev Account must be available.
     */
    const identityAvailable = await this.googleIdp.checkAvailable(
      verifiedTokenData.identityId,
    );
    if (!identityAvailable) {
      throw new ConflictException('IDP::IDENTITY_EXISTED');
    }

    /**
     * @dev Create empty user.
     */
    const user = await this.userService.createUser({
      email: verifiedTokenData.email,
      email_verified: true,
    });

    /**
     * @dev Link Google account to user
     */
    const enabledIdp = await this.EnabledIdpDocument.create({
      userId: user.id,
      type: AvailableIdpResourceName.Google,
      identityId: verifiedTokenData.identityId,
    });

    return this.tokenIssuer.grantImpersonatingKeycloakAccessToken({
      keycloakUserId: user.id,
      enabledIdpId: enabledIdp._id,
    });
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
      enabledIdpId: `${AvailableIdpResourceName.Google}-${enabledIdpId}`,
    });

    /**
     * @dev Then delete.
     */
    for (const session of sessions) {
      await this.sessionService.endSession(userId, session.sessionOrigin);
    }
  }
}
