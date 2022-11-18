import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { UpdatePasswordDto } from '../dto/update-password.dto';
import { KeycloakAdminProvider } from '../../providers/federated-users/keycloak-admin.provider';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { RegistryProvider } from '../../providers/registry.provider';
import { TokenIssuerService } from './token-issuer.service';
import { EmailProvider } from '../../providers/email.provider';
import { CreatePasswordDto } from '../dto/create-password.dto';

/**
 * @dev Password Service handles all password-related logics
 */
@Injectable()
export class PasswordService {
  /**
   * @dev Initialize password service with low-level providers.
   * @param keycloakAdminProvider
   * @param registryProvider
   * @param emailProvider
   * @param tokenIssuerService
   */
  constructor(
    /**
     * @dev Inject providers
     */
    private readonly keycloakAdminProvider: KeycloakAdminProvider,
    private readonly registryProvider: RegistryProvider,
    private readonly emailProvider: EmailProvider,
    /**
     * @dev Inject services
     */
    private readonly tokenIssuerService: TokenIssuerService,
  ) {}

  /**
   * @dev Create a first password for user
   * @param userId Keycloak account id
   * @param createPasswordDto Contain the password
   */
  public async createPassword(
    userId: string,
    createPasswordDto: CreatePasswordDto,
  ): Promise<void> {
    /**
     * @dev Retrieve user credentials
     */
    const credentials =
      await this.keycloakAdminProvider.instance.users.getCredentials({
        id: userId,
      });

    /**
     * @dev Check if user already create a password
     */
    const passwordExists = credentials.find(({ type }) => type === 'password');
    if (passwordExists) {
      throw new ConflictException('PASSWORD::ALREADY_CREATED');
    }

    /**
     * @dev Create a credential with password type
     */
    await this.keycloakAdminProvider.instance.users.resetPassword({
      id: userId,
      credential: {
        type: 'password',
        value: createPasswordDto.password,
        temporary: false,
      },
    });
  }

  /**
   * @dev Reset user password.
   * @param userId
   * @param updatePasswordDto
   */
  public updatePassword(
    userId: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    /**
     * @dev Trigger keycloak to reset user password.
     */
    return this.keycloakAdminProvider.instance.users.resetPassword({
      id: userId,
      credential: {
        type: 'password',
        value: updatePasswordDto.newPassword,
        temporary: false,
      },
    });
  }

  /**
   * @dev Request reset password session.
   * @param email
   */
  public async requestResetPasswordSession(email: string): Promise<void> {
    /**
     * @dev Find the user that has email.
     */
    const [user] = await this.keycloakAdminProvider.instance.users.find({
      email,
    });

    /**
     * @dev No user found, return.
     */
    if (!user) {
      throw new NotFoundException();
    }

    /**
     * @dev Generate access token.
     */
    const resetPasswordToken =
      await this.tokenIssuerService.grantResetPasswordAccessToken({
        actorId: user.id,
      });

    /**
     * @dev Declare the key
     */
    const key = 'reset-password-via-email';

    /**
     * @dev Define the reset password link.
     */
    const resetPasswordLink = `${
      this.registryProvider.getConfig().HOST_URI
    }/${key}?email=${encodeURIComponent(
      email,
    )}&authToken=${resetPasswordToken}`;

    /**
     * @dev Finally send email.
     */
    return this.emailProvider.sendResetPasswordEmail(
      { email, resetPasswordLink },
      email,
    );
  }

  /**
   * @dev Reset password for user.
   * @param userId
   * @param resetPasswordDto
   */
  public resetPassword(
    userId: string,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<void> {
    /**
     * @dev Trigger keycloak to reset user password.
     */
    return this.keycloakAdminProvider.instance.users.resetPassword({
      id: userId,
      credential: {
        type: 'password',
        value: resetPasswordDto.newPassword,
        temporary: false,
      },
    });
  }
}
