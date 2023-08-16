import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/**
 * @dev Import logic deps.
 */
import { TokenSetEntity } from '../entities/token-set.entity';
import { EnabledIdpModel } from '../../orm/model/enabled-idp.model';
import { ExtendedSessionModel } from '../../orm/model/extended-session.model';
import { TokenIssuerService } from '../services/token-issuer.service';
import { UserService } from '../../user/services/user.service';
import { AuthSessionService } from '../services/auth-session.service';
import { AvailableIdpResourceName } from '../../providers/idp/identity-provider.interface';
import { IdpResourceBuilder } from '../../user/factories/idp-resource.builder';
import { SolanaWalletAuthenticator } from './idp/solana-wallet-auth.authenticator';
import { AvatarProvider } from '../../providers/avatar.provider';
import { EvmWalletAuthAuthenticator } from './idp/evm-wallet-auth.authenticator';

/**
 * @dev Define IdpAuthService interface.
 */
export interface IdpAuthenticator {
  /**
   * @dev Authenticate signature and return token set entity.
   * @param base64Signature
   */
  signIn(base64Signature: string): Promise<TokenSetEntity>;

  /**
   * @dev Register account with valid signature, and return token set entity.
   * @param base64Signature
   */
  signUp(base64Signature: string): Promise<TokenSetEntity>;

  /**
   * @dev Clean up related sessions so that can be unlinked gracefully.
   * @param userId
   * @param enabledIdpId
   */
  removeRelatedSessions(userId: string, enabledIdpId: string): Promise<void>;
}

/**
 * @dev Define IdpAuthBuilder service
 */
@Injectable()
export class IdpAuthBuilder {
  constructor(
    /**
     * @dev Inject models
     */
    @InjectRepository(EnabledIdpModel)
    private readonly EnabledIdpRepo: Repository<EnabledIdpModel>,
    @InjectRepository(ExtendedSessionModel)
    private readonly ExtendedSessionRepo: Repository<ExtendedSessionModel>,

    /**
     * @dev Inject services
     */
    private readonly idpResourceBuilder: IdpResourceBuilder,
    private readonly tokenIssuer: TokenIssuerService,
    private readonly userService: UserService,
    private readonly sessionService: AuthSessionService,
    private readonly avatarProvider: AvatarProvider,
  ) {}

  /**
   * @dev Get idp auth service based on type.
   * @param type
   */
  public getIdpAuthService(type: AvailableIdpResourceName): IdpAuthenticator {
    /**
     * @dev Switch type and return the auth service accordingly.
     */
    switch (type) {
      case AvailableIdpResourceName.SolanaWallet:
        return new SolanaWalletAuthenticator(
          this.EnabledIdpRepo,
          this.ExtendedSessionRepo,
          this.idpResourceBuilder.getIdpResource(
            AvailableIdpResourceName.SolanaWallet,
          ),
          this.tokenIssuer,
          this.userService,
          this.sessionService,
          this.avatarProvider,
        );

      case AvailableIdpResourceName.EVMWallet:
        return new EvmWalletAuthAuthenticator(
          this.EnabledIdpRepo,
          this.ExtendedSessionRepo,
          this.idpResourceBuilder.getIdpResource(
            AvailableIdpResourceName.EVMWallet,
          ),
          this.tokenIssuer,
          this.userService,
          this.sessionService,
          this.avatarProvider,
        );
    }

    throw new UnprocessableEntityException('IDP::NOT_SUPPORTED_IDP');
  }
}
