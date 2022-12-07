import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';

import { UserEntity } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { StorageProvider } from '../../providers/s3.provider';
import { CreateUserDto } from '../dto/create-user.dto';
import { plainToInstance } from 'class-transformer';
import { UserModel } from '../../orm/model/user.model';
import { SwapProposalModel } from '../../orm/model/swap-proposal.model';
import { SwapProposalStatus } from '../../swap/entities/swap-proposal.entity';
import {
  UserOrderStatDto,
  UserPublicProfileDto,
} from '../dto/user-profile.dto';

/**
 * @dev User service declaration. `UserService` handles all operations related to profile.
 */
@Injectable()
export class UserService {
  /**
   * @dev Construct initializes the user service.
   * @param storageProvider
   * @param keycloakAdminProvider
   * @param keycloakUserProvider
   * @param WalletDocument
   */
  constructor(
    /**
     * @dev Inject providers
     */
    private readonly storageProvider: StorageProvider,
    @InjectRepository(UserModel)
    private readonly userRepo: Repository<UserModel>,
    @InjectRepository(SwapProposalModel)
    private readonly proposalRepo: Repository<SwapProposalModel>,
  ) {}

  /**
   * @dev The function to check whether user has verified email or not.
   * @param userId
   * @private
   */
  public async didUserVerifyEmail(userId: string): Promise<boolean> {
    /**
     * @dev Find user id.
     */
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('ACCOUNT::ACCOUNT_NOT_FOUND');
    }

    /**
     * @dev Return user state.
     */
    return user.emailVerified;
  }

  /**
   * @dev Create and store to keycloak user.
   * @param createUserDto
   */
  public async createUser(
    createUserDto: CreateUserDto,
  ): Promise<{ id: string }> {
    /**
     * @dev Create users based on the signed up data.
     */
    const { id } = await this.userRepo.save(createUserDto);

    /**
     * @dev Returning the payload.
     */
    return { id };
  }

  /**
   * @dev Update user email
   * @param userId
   * @param email
   */
  public async updateUserEmail(
    userId: string,
    email: string,
  ): Promise<UserEntity> {
    /**
     * @dev TODO: add constraints check.
     */
    const user = await this.userRepo.update(
      {
        id: userId,
      },
      {
        email,
        emailVerified: true,
      },
    );

    return plainToInstance(UserEntity, user);
  }

  /**
   * @dev Update user profile.
   * @param authToken
   * @param updateUserDto
   */
  public async updateUserProfile(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    if (updateUserDto.email) {
      const isTaken = !!(await this.userRepo.count({
        where: { email: updateUserDto.email, id: Not(id) },
      }));

      if (isTaken) {
        throw new ConflictException('USER::EMAIL_EXISTS');
      }
    }

    /**
     * @dev Perform user update
     */
    const user = await this.userRepo.update({ id }, updateUserDto);

    return plainToInstance(UserEntity, user);
  }

  /**
   * @dev Upload file and update avatar attribute.
   * @param authToken
   * @param file
   */
  public async uploadAvatar(userId: string, file: any): Promise<UserEntity> {
    /**
     * @dev Upload and get file url
     */
    const { originalname, buffer } = file;
    const fileName = `${new Date().getTime()}.${originalname}`;
    const { url } = await this.storageProvider.upload(fileName, buffer);

    /**
     * @dev Update avatar attribute.
     */
    return this.updateUserProfile(userId, {
      avatar: url,
    });
  }

  /**
   * @dev Get user profile by id.
   * @param userId
   */
  public async getUserProfileById(userId: string): Promise<UserEntity> {
    /**
     * @dev Find user.
     */
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    /**
     * @dev If user was not found, raise error.
     */
    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  public async getUserProfileByIds(
    ids: string[],
  ): Promise<UserPublicProfileDto[]> {
    /**
     * @dev fetch users
     */
    const users = await this.userRepo.find({
      where: { id: In(ids) },
      relations: { enabledIdps: true },
    });

    /**
     * @dev fetch orders stat
     */
    const userOrdersStatsMap: Record<string, UserOrderStatDto> = {};
    await Promise.all(
      users.map(async ({ id }) => {
        userOrdersStatsMap[id] = await this.getUserStat(id);
      }),
    );

    return users.map<UserPublicProfileDto>(
      ({ id, avatar, telegram, twitter, enabledIdps }) => {
        return {
          id,
          avatar,
          telegram,
          twitter,
          walletAddress: enabledIdps[0]?.identityId,
          ordersStat: userOrdersStatsMap[id],
        };
      },
    );
  }

  public async getUserStat(userId: string): Promise<UserOrderStatDto> {
    const orders = await this.proposalRepo.countBy({
      ownerId: userId,
      status: Not(SwapProposalStatus.CREATED),
    });

    const completedOrders = await this.proposalRepo.countBy({
      ownerId: userId,
      status: SwapProposalStatus.FULFILLED,
    });

    return {
      orders,
      completedOrders,
    };
  }
}
