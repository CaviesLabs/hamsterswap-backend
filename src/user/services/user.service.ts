import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';

import { KeycloakAdminProvider } from '../../providers/federated-users/keycloak-admin.provider';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserEntity, UserGroup } from '../entities/user.entity';
import { UpdateEmailStatus, UpdateUserDto } from '../dto/update-user.dto';
import { StorageProvider } from '../../providers/s3.provider';
import { KeycloakUserProvider } from '../../providers/federated-users/keycloak-user.provider';

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
    private readonly keycloakAdminProvider: KeycloakAdminProvider,
    private readonly keycloakUserProvider: KeycloakUserProvider,
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
    const user = await this.keycloakAdminProvider.instance.users.findOne({
      id: userId,
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
    createUserDto: CreateUserDto & UpdateEmailStatus,
  ): Promise<{ id: string }> {
    /**
     * @dev Create user with the assigned group.
     */
    const { first_name, last_name } = createUserDto.attributes || {};

    /**
     * @dev clean up.
     */
    delete createUserDto.attributes?.first_name;
    delete createUserDto.attributes?.last_name;

    /**
     * @dev Prepare create user data.
     * - username: generated UUID v4
     */
    const userData: UserRepresentation = {
      username: randomUUID(),
      groups: [UserGroup.Gamer],
      email: createUserDto.email,
      emailVerified: createUserDto.email_verified,
      firstName: first_name,
      lastName: last_name,
      attributes: createUserDto.attributes,
      credentials: [],
      enabled: true,
    };

    if (createUserDto.password) {
      userData.credentials.push({
        type: 'password',
        value: createUserDto.password,
        temporary: false,
      });
    }

    /**
     * @dev Create users based on the signed up data.
     */
    const { id } = await this.keycloakAdminProvider.instance.users.create(
      userData,
    );

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
  public async updateUserEmail(userId: string, email: string): Promise<void> {
    /**
     * @dev TODO: add constraints check.
     */
    return this.keycloakAdminProvider.instance.users.update(
      {
        id: userId,
      },
      {
        email,
      },
    );
  }

  /**
   * @dev Update user profile.
   * @param authToken
   * @param updateUserDto
   */
  public async updateUserProfile(
    authToken: string,
    updateUserDto: UpdateUserDto & UpdateEmailStatus,
  ): Promise<UserEntity> {
    /**
     * @dev Create user with the assigned group.
     */
    const { username, first_name, last_name, email_verified } = updateUserDto;

    /**
     * @dev clean up.
     */
    delete updateUserDto.username;
    delete updateUserDto.first_name;
    delete updateUserDto.last_name;
    delete updateUserDto.email_verified;

    /**
     * @dev Check for username is already taken.
     */
    const [userExists] = await this.keycloakAdminProvider.instance.users.find({
      username,
    });
    if (userExists) {
      throw new BadRequestException('ACCOUNT::USERNAME_ALREADY_TAKEN');
    }

    /**
     * @dev Perform user update
     */
    return this.keycloakUserProvider.updateUserProfile(authToken, {
      username,
      firstName: first_name,
      lastName: last_name,
      emailVerified: email_verified,
      attributes: updateUserDto,
    });
  }

  /**
   * @dev Return user profile.
   * @param authJwt
   */
  public getProfile(authJwt: string): Promise<UserEntity> {
    return this.keycloakUserProvider.getUserProfile(authJwt);
  }

  /**
   * @dev Upload file and update avatar attribute.
   * @param authToken
   * @param file
   */
  public async uploadAvatar(authToken: string, file: any): Promise<UserEntity> {
    /**
     * @dev Upload and get file url
     */
    const { originalname, buffer } = file;
    const fileName = `${new Date().getTime()}.${originalname}`;
    const { url } = await this.storageProvider.upload(fileName, buffer);

    /**
     * @dev Update avatar attribute.
     */
    return this.updateUserProfile(authToken, {
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
    const user = await this.keycloakAdminProvider.instance.users.findOne({
      id: userId,
    });

    /**
     * @dev If user was not found, raise error.
     */
    if (!user) {
      throw new NotFoundException();
    }

    return {
      email: user.email,
      sub: user.id,
      email_verified: user.emailVerified,
    };
  }
}
