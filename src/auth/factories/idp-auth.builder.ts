import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

/**
 * @dev Import logic deps.
 */
import { TokenSetEntity } from '../entities/token-set.entity';
import {
  EnabledIdpDocument,
  EnabledIdpModel,
} from '../../orm/model/enabled-idp.model';
import {
  ExtendedSessionDocument,
  ExtendedSessionModel,
} from '../../orm/model/extended-session.model';
import { KeycloakAdminProvider } from '../../providers/federated-users/keycloak-admin.provider';
import { TokenIssuerService } from '../services/token-issuer.service';
import { UserService } from '../../user/services/user.service';
import { AuthSessionService } from '../services/auth-session.service';
import { AvailableIdpResourceName } from '../../providers/idp/identity-provider.interface';
import { EvmWalletAuthenticator } from './idp/evm-wallet-auth.authenticator';
import { IdpResourceBuilder } from '../../user/factories/idp-resource.builder';
import { GoogleAuthenticator } from './idp/google-auth.authenticator';

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
    @InjectModel(EnabledIdpModel.name)
    private readonly EnabledIdpDocument: Model<EnabledIdpDocument>,
    @InjectModel(ExtendedSessionModel.name)
    private readonly ExtendedSessionDocument: Model<ExtendedSessionDocument>,

    /**
     * @dev Inject providers
     */
    private readonly keycloakAdmin: KeycloakAdminProvider,
    /**
     * @dev Inject services
     */
    private readonly idpResourceBuilder: IdpResourceBuilder,
    private readonly tokenIssuer: TokenIssuerService,
    private readonly userService: UserService,
    private readonly sessionService: AuthSessionService,
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
      case AvailableIdpResourceName.EVMWallet:
        return new EvmWalletAuthenticator(
          this.EnabledIdpDocument,
          this.ExtendedSessionDocument,
          this.keycloakAdmin,
          this.idpResourceBuilder.getIdpResource(
            AvailableIdpResourceName.EVMWallet,
          ),
          this.tokenIssuer,
          this.userService,
          this.sessionService,
        );
      case AvailableIdpResourceName.Google:
        return new GoogleAuthenticator(
          this.EnabledIdpDocument,
          this.ExtendedSessionDocument,
          this.keycloakAdmin,
          this.idpResourceBuilder.getIdpResource(
            AvailableIdpResourceName.Google,
          ),
          this.tokenIssuer,
          this.sessionService,
          this.userService,
        );
    }

    throw new UnprocessableEntityException('IDP::NOT_SUPPORTED_IDP');
  }
}
