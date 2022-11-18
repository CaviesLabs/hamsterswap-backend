import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

/**
 * @dev Import logic deps.
 */
import {
  AuthChallengeDocument,
  AuthChallengeModel,
} from '../../orm/model/auth-challenge.model';
import { AuthChallengeEntity } from '../entities/auth-challenge.entity';
import { UtilsProvider } from '../../providers/utils.provider';

/**
 * @dev AuthChallengeService handles all auth challenge related logic
 */
@Injectable()
export class AuthChallengeService {
  constructor(
    /**
     * @dev Inject auth challenge model.
     */
    @InjectModel(AuthChallengeModel.name)
    private readonly AuthChallengeDocument: Model<AuthChallengeDocument>,
  ) {}

  /**
   * @notice Generate auth challenge. TODO: generate different messages according to different use cases.
   * @param target
   * @param delta
   */
  public async generateAuthChallenge(
    target: string,
    delta = 60,
  ): Promise<AuthChallengeDocument> {
    /**
     * @dev Extract timestamp.
     */
    const currentDateTime = new Date();
    const expiryDate = currentDateTime.setTime(
      currentDateTime.getTime() + 60 * 1000,
    );

    /**
     * @dev Construct payload.
     */
    const payload: AuthChallengeEntity = {
      target,
      expiryDate: expiryDate,
      isResolved: false,
      durationDelta: delta,
      memo: '',
    };

    /**
     * @dev Generate checksum based on data.
     */
    const checksum = await new UtilsProvider().generateChecksum(
      JSON.stringify(payload),
    );

    /**
     * @dev Generate memo
     */
    const message = `Authorize a session for ${target}.\nChallenge hash: ${checksum}.\nDate: ${currentDateTime.toISOString()}.`;

    /**
     * @dev Create new auth challenge.
     */
    const authChallenge = new this.AuthChallengeDocument({
      ...payload,
      memo: message,
    });

    /**
     * @dev Return challenge document.
     */
    return authChallenge.save();
  }

  /**
   * @dev Resolve auth challenge.
   * @param authChallengeId
   */
  public async resolveAuthChallenge(authChallengeId: string) {
    /**
     * @dev Find the id.
     */
    const authChallenge = await this.AuthChallengeDocument.findById(
      authChallengeId,
    );

    /**
     * @dev Resolve the auth challenge.
     */
    authChallenge.isResolved = true;

    /**
     * @dev Save the status.
     */
    return authChallenge.save();
  }

  /**
   * @dev Get latest auth challenge.
   * @param target
   */
  public async getLatestAuthChallenge(
    target: string,
  ): Promise<AuthChallengeDocument | null> {
    /**
     * @dev Find the latest doc.
     */
    const result = await this.AuthChallengeDocument.find({
      target,
      isResolved: false,
      expiryDate: {
        $gt: new Date(),
      },
    })
      .sort({ createdAt: -1 })
      .limit(1)
      .exec();

    return result[0] || null;
  }
}
