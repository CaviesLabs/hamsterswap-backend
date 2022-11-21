import { AuthSessionModel } from '../../orm/model/auth-session.model';
import { ExtendedSessionModel } from '../../orm/model/extended-session.model';
import { SessionDistributionType } from '../entities/extended-session.entity';
import { NotFoundException } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';

/**
 * @dev AuthSessionService handles all session related logic.
 */
export class AuthSessionService {
  constructor(
    /**
     * @dev Inject connection interface
     */
    @InjectEntityManager() private readonly entityManager: EntityManager,

    /**
     * @dev Inject auth session model
     */
    @InjectRepository(AuthSessionModel)
    private readonly AuthSessionRepo: Repository<AuthSessionModel>,
    @InjectRepository(ExtendedSessionModel)
    private readonly ExtendedSessionRepo: Repository<ExtendedSessionModel>,
  ) {}

  /**
   * @dev Find auth session by id.
   * @param id
   */
  public async findAuthSessionById(id: string): Promise<AuthSessionModel> {
    return this.AuthSessionRepo.findOne({ where: { id } });
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
    const session = await this.ExtendedSessionRepo.findOne({
      where: { id: extendedSessionId, userId },
    });

    /**
     * @dev Throw error if session isn't available.
     */
    if (!session) {
      throw new NotFoundException('SESSION::SESSION_NOT_AVAILABLE');
    }

    return this.deletePrematureAuthSessionById(session.sessionOrigin);
  }

  /**
   * @dev List available sessions.
   */
  public async listUserExtendedSession(
    userId: string,
  ): Promise<ExtendedSessionModel[]> {
    return this.ExtendedSessionRepo.find({ where: { userId } });
  }

  /**
   * @dev Allow user to logout all sessions
   */
  public async deleteAllSessions(userId: string): Promise<void> {
    /**
     * @dev Should wrap whole process in a transaction.
     */
    await this.entityManager.transaction(async (em) => {
      await em.delete(ExtendedSessionModel, { userId });
    });
  }

  /**
   * @dev Delete auth session by id.
   * @param id
   */
  public async deletePrematureAuthSessionById(id: string): Promise<void> {
    /**
     * @dev Should wrap whole process in a transaction.
     */
    await this.entityManager.transaction(async (em) => {
      await em.delete(AuthSessionModel, { id });
      await em.delete(ExtendedSessionModel, {
        sessionOrigin: id,
        distributionType: SessionDistributionType.PreMature,
      });
    });
  }
}
