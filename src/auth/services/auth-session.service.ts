import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import {
  AuthSessionDocument,
  AuthSessionModel,
} from '../../orm/model/auth-session.model';
import {
  ExtendedSessionDocument,
  ExtendedSessionModel,
} from '../../orm/model/extended-session.model';
import { SessionDistributionType } from '../entities/extended-session.entity';
import { KeycloakAdminProvider } from '../../providers/federated-users/keycloak-admin.provider';
import { OpenIDProvider } from '../../providers/federated-users/openid.provider';
import { NotFoundException } from '@nestjs/common';

/**
 * @dev AuthSessionService handles all session related logic.
 */
export class AuthSessionService {
  constructor(
    /**
     * @dev Inject connection interface
     */
    @InjectConnection() private readonly connection: mongoose.Connection,

    /**
     * @dev Inject auth session model
     */
    @InjectModel(AuthSessionModel.name)
    private readonly AuthSessionDocument: Model<AuthSessionDocument>,
    @InjectModel(ExtendedSessionModel.name)
    private readonly ExtendedSessionDocument: Model<ExtendedSessionDocument>,

    /**
     * @dev Inject providers
     */
    private readonly keycloakAdminProvider: KeycloakAdminProvider,

    /**
     * @dev Inject services
     */
    private readonly openIdProvider: OpenIDProvider,
  ) {}

  /**
   * @dev Find auth session by id.
   * @param id
   */
  public async findAuthSessionById(id: string): Promise<AuthSessionDocument> {
    return this.AuthSessionDocument.findOne({ _id: id }).exec();
  }

  /**
   * @dev End a session.
   * @param userId
   * @param extendedSessionId
   */
  public async endSession(
    userId: string,
    extendedSessionId: string,
  ): Promise<void> {
    /**
     * @dev Find session origin.
     */
    const session = await this.ExtendedSessionDocument.findOne({
      _id: extendedSessionId,
      userId,
    }).exec();

    /**
     * @dev Throw error if session isn't available.
     */
    if (!session) {
      throw new NotFoundException('SESSION::SESSION_NOT_AVAILABLE');
    }

    if (session.distributionType === SessionDistributionType.KeyCloak) {
      return this.deleteKeycloakSessionById(session.sessionOrigin);
    }

    if (session.distributionType === SessionDistributionType.PreMature) {
      return this.deletePrematureAuthSessionById(session.sessionOrigin);
    }
  }

  /**
   * @dev List available sessions.
   */
  public async listUserExtendedSession(
    userId: string,
  ): Promise<ExtendedSessionDocument[]> {
    return this.ExtendedSessionDocument.find({ userId }).exec();
  }

  /**
   * @dev Allow user to logout all sessions
   */
  public async deleteAllSessions(userId: string): Promise<void> {
    /**
     * @dev Should wrap whole process in a transaction.
     */
    const dbSession = await this.connection.startSession();
    await dbSession.startTransaction();

    await this.keycloakAdminProvider.instance.users.logout({ id: userId });
    await this.ExtendedSessionDocument.deleteMany({ userId });

    /**
     * @dev End transaction.
     */
    await dbSession.commitTransaction();
    await dbSession.endSession();
  }

  /**
   * @dev Delete auth session by id.
   * @param id
   */
  public async deletePrematureAuthSessionById(id: string): Promise<void> {
    /**
     * @dev Should wrap whole process in a transaction.
     */
    const dbSession = await this.connection.startSession();
    await dbSession.startTransaction();

    await this.AuthSessionDocument.deleteOne({ _id: id }).exec();
    await this.ExtendedSessionDocument.deleteOne({
      sessionOrigin: id,
      distributionType: SessionDistributionType.PreMature,
    }).exec();

    /**
     * @dev End transaction.
     */
    await dbSession.commitTransaction();
    await dbSession.endSession();
  }

  /**
   * @dev Delete auth session by id.
   * @param id
   */
  public async deleteKeycloakSessionById(id: string): Promise<void> {
    /**
     * @dev Should wrap whole process in a transaction.
     */
    const dbSession = await this.connection.startSession();
    await dbSession.startTransaction();

    await this.keycloakAdminProvider.deleteSession(id);
    await this.ExtendedSessionDocument.deleteOne({
      sessionId: id,
      distributionType: SessionDistributionType.KeyCloak,
    }).exec();

    /**
     * @dev End transaction.
     */
    await dbSession.commitTransaction();
    await dbSession.endSession();
  }

  /**
   * @dev Extend keycloak session.
   * @param accessToken
   * @param options
   * @private
   */
  public async extendKeycloakSession(
    accessToken: string,
    options: { enabledIdpId?: string },
  ): Promise<void> {
    /**
     * @dev Introspect jwt
     */
    const introspectedJwt = await this.openIdProvider.instance.introspect(
      accessToken,
    );

    /**
     * @dev Create the extended session
     */
    const extendedSession = new this.ExtendedSessionDocument({
      userId: introspectedJwt.sub,
      sessionOrigin: introspectedJwt.sid,
      distributionType: SessionDistributionType.KeyCloak,
      enabledIdpId: options.enabledIdpId,
    });
    await extendedSession.save();
  }
}
