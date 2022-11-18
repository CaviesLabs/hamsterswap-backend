import { Injectable } from '@nestjs/common';
/**
 * @dev Import dtos
 */
import { EmailLoginDto } from '../dto/email-login.dto';
import { EmailSignUpDto } from '../dto/email-signup.dto';

import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { UserService } from '../../user/services/user.service';
import { TokenSetEntity } from '../entities/token-set.entity';
import { TokenIssuerService } from './token-issuer.service';

/**
 * @dev `AuthenticationService` handles keycloak authentication.
 */
@Injectable()
export class AuthenticationService {
  /**
   * @dev Constructor to inject dependencies.
   * @param userService
   * @param tokenIssuerService
   */
  constructor(
    /**
     * @dev Inject services
     */
    private readonly userService: UserService,
    private readonly tokenIssuerService: TokenIssuerService,
  ) {}

  /**
   * @dev Sign user up using keycloak backend.
   * @param {EmailSignUpDto} signUpDto
   */
  public async signUpUser(signUpDto: EmailSignUpDto): Promise<TokenSetEntity> {
    await this.userService.createUser(signUpDto);
    return this.tokenIssuerService.grantKeycloakDirectAccessToken({
      email: signUpDto.email,
      password: signUpDto.password,
    });
  }

  /**
   * @dev Sign in user using keycloak credential.
   * @param loginDto
   */
  public async signInUser(loginDto: EmailLoginDto): Promise<TokenSetEntity> {
    return this.tokenIssuerService.grantKeycloakDirectAccessToken({
      email: loginDto.email,
      password: loginDto.password,
    });
  }

  /**
   * @dev Refresh token and return new access token using Keycloak oauth.
   * @param refreshTokenDto
   */
  public async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<TokenSetEntity> {
    return this.tokenIssuerService.refreshKeycloakAccessToken({
      currentRefreshToken: refreshTokenDto.refresh_token,
    });
  }
}
