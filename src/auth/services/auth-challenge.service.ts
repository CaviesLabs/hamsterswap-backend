import { Injectable } from '@nestjs/common';

/**
 * @dev Import logic deps.
 */
import { AuthChallengeModel } from '../../orm/model/auth-challenge.model';
import { AuthChallengeEntity } from '../entities/auth-challenge.entity';
import { UtilsProvider } from '../../providers/utils.provider';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

/**
 * @dev AuthChallengeService handles all auth challenge related logic
 */
@Injectable()
export class AuthChallengeService {
  constructor(
    /**
     * @dev Inject auth challenge model.
     */
    @InjectRepository(AuthChallengeModel)
    private readonly AuthChallengeRepo: Repository<AuthChallengeModel>,
  ) {}

  /**
   * @notice Generate auth challenge. TODO: generate different messages according to different use cases.
   * @param target
   * @param delta
   */
  public async generateAuthChallenge(
    target: string,
    delta = 60,
  ): Promise<AuthChallengeModel> {
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
    return this.AuthChallengeRepo.save({
      ...payload,
      memo: message,
    });
  }

  /**
   * @dev Resolve auth challenge.
   * @param authChallengeId
   */
  public async resolveAuthChallenge(authChallengeId: string) {
    /**
     * @dev Find the id.
     */
    await this.AuthChallengeRepo.findOneOrFail({
      where: {
        id: authChallengeId,
      },
    });

    /**
     * @dev Resolve the auth challenge, and save the status.
     */
    return this.AuthChallengeRepo.update(
      { id: authChallengeId },
      { isResolved: true },
    );
  }

  /**
   * @dev Get latest auth challenge.
   * @param target
   */
  public async getLatestAuthChallenge(
    target: string,
  ): Promise<AuthChallengeModel | null> {
    /**
     * @dev Find the latest doc.
     */
    return this.AuthChallengeRepo.findOne({
      where: {
        target,
        isResolved: false,
        expiryDate: MoreThan(new Date()),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
