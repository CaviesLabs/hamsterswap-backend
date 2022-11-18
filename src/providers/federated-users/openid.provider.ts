import { HttpException, Injectable } from '@nestjs/common';

import { Client, DPoPInput, Issuer } from 'openid-client';

import { TokenSetEntity } from '../../auth/entities/token-set.entity';
import { RegistryProvider } from '../registry.provider';
import { UtilsProvider } from '../utils.provider';

/**
 * @dev Export token response.
 */
export type TokenResponse = TokenSetEntity;
export type TokenSetParameters = TokenSetEntity;

/**
 * @dev Provider state.
 */
enum OpenIDProviderState {
  UNINITIALIZED,
  INITIALIZED,
  ERROR,
}

const AUTO_POLLING_MSEC = 5 * 60 * 1000;

/**
 * @dev Request options.
 */
export interface RequestOptions {
  headers?: object;
  method?:
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'HEAD'
    | 'DELETE'
    | 'OPTIONS'
    | 'TRACE'
    | 'PATCH';
  tokenType?: string;
  DPoP?: DPoPInput;
}

/**
 * @dev Keycloak Credential, can be obtained from Keycloak admin portal.
 */
type KeycloakCredential = {
  AUTH_URL: string;
  AUTH_REALM_NAME: string;
  KEYCLOAK_AUTH_PASSPORT_CLIENT_ID: string;
  KEYCLOAK_AUTH_PASSPORT_CLIENT_SECRET: string;
};

/**
 * @dev OpenId Provider handles Passport Authentication via Keycloak.
 */
@Injectable()
export class OpenIDProvider {
  /**
   * @dev OpenId Client instance.
   * @private
   */
  private _client: Client;

  /**
   * @dev Indicate that provider is initialized.
   * @type {boolean}
   * @private
   */
  private state: OpenIDProviderState = OpenIDProviderState.UNINITIALIZED;

  /**
   * @dev Binding Keycloak credential.
   * @type {KeycloakCredential}
   * @private
   */
  private readonly credential: KeycloakCredential;

  /**
   * @dev baseUrl endpoint.
   * @private
   */
  private readonly baseUrl: string;

  /**
   * @dev Constructor that initializes the provider.
   * @param registryProvider
   */
  constructor(private registryProvider: RegistryProvider) {
    /**
     * @dev Binding credentials.
     */
    this.credential = this.loadCredentials();

    /**
     * @dev Discover OAuth client.
     */
    this.baseUrl = `${this.credential.AUTH_URL}/auth/realms/${this.credential.AUTH_REALM_NAME}`;

    /**
     * @dev Initialize and start polling.
     */
    this.initializeOpenIDClient().then(() => {
      /**
       * @dev Re-authenticate OpenID Client in interval periods.
       */
      new UtilsProvider().withInterval(async () => {
        console.log('Begin re-authentication for OpenID provider ...');

        /**
         * @dev Start re-authentication.
         */
        await this.initializeOpenIDClient();
      }, AUTO_POLLING_MSEC);
    });
  }

  /**
   * @dev Load and binding credential.
   * @returns {KeycloakCredential}
   * @private
   */
  private loadCredentials(): KeycloakCredential {
    const config = this.registryProvider.getConfig();
    const authUrl = config.KEYCLOAK_AUTH_URL;
    const authRealmName = config.KEYCLOAK_AUTH_REALM_NAME;
    const clientId = config.KEYCLOAK_AUTH_PASSPORT_CLIENT_ID;
    const clientSecret = config.KEYCLOAK_AUTH_PASSPORT_CLIENT_SECRET;

    return {
      AUTH_URL: authUrl,
      AUTH_REALM_NAME: authRealmName,
      KEYCLOAK_AUTH_PASSPORT_CLIENT_ID: clientId,
      KEYCLOAK_AUTH_PASSPORT_CLIENT_SECRET: clientSecret,
    };
  }

  /**
   * @dev Initialize OpenID client.
   * @private
   */
  private initializeOpenIDClient(): Promise<void> {
    /**
     * @dev Discover and set client state.
     */
    return Issuer.discover(this.baseUrl)
      .then((res) => {
        this._client = new res.Client({
          client_id: this.credential.KEYCLOAK_AUTH_PASSPORT_CLIENT_ID,
          client_secret: this.credential.KEYCLOAK_AUTH_PASSPORT_CLIENT_SECRET,
        });

        this.state = OpenIDProviderState.INITIALIZED;
      })
      .catch(() => {
        this.state = OpenIDProviderState.ERROR;
      });
  }

  /**
   * @dev Keycloak instance getter.
   * @returns {Client | null}
   */
  get instance(): Client | null {
    if (this.state === OpenIDProviderState.INITIALIZED) {
      return this._client;
    }

    throw new Error("OpenIDProvider isn't initialized");
  }

  /**
   * @dev This is used for exchanging external token for internal Keycloak token. Aka login with external providers (Google, Facebook, Twitter, ...).
   * @notice Please see ref: https://www.keycloak.org/docs/latest/securing_apps/#external-token-to-internal-token-exchange
   * @param provider
   * @param accessToken
   */
  public exchangeForInternalToken(
    provider: string,
    accessToken: string,
  ): Promise<TokenResponse> {
    return this.instance.grant({
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
      subject_token: accessToken,
      subject_issuer: provider,
      audience: this.credential.KEYCLOAK_AUTH_PASSPORT_CLIENT_ID,
    });
  }

  /**
   * @dev This is used for impersonating account. USE THIS AS HIGHEST SECURITY CAUTION.
   * Please see ref: https://medium.com/@shavi22/user-impersonation-with-keycloak-3397f3451b4
   * @param userId
   */
  public impersonateAccount(userId: string): Promise<TokenResponse> {
    return this.instance.grant({
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      requested_subject: userId,
    });
  }

  /**
   * @dev Request resource with appropriate resource id.
   * @param resource
   * @param accessToken
   * @param payload
   * @param options
   */
  public async requestResource<Response>(
    resource: { resourceName: string },
    accessToken: string,
    payload?: string,
    options?: RequestOptions,
  ): Promise<Response> {
    /**
     * @dev Send request resource.
     */
    const request = await this.instance.requestResource(
      `${this.baseUrl}/${resource.resourceName}`,
      accessToken,
      {
        body: payload as string,
        ...options,
      },
    );

    /**
     * @dev Raise error if the request gets error.
     */
    if (Number(request.statusCode) / 400 >= 1) {
      throw new HttpException(
        `${request.statusMessage} ${request.body.toString()}`,
        Number(request.statusCode),
      );
    }

    /**
     * @dev Return response.
     */
    try {
      return JSON.parse(request.body?.toString()) as unknown as Response;
    } catch {
      return (
        (request.body?.toString() as unknown as Response) || ('' as Response)
      );
    }
  }

  /**
   * @dev Request resource with appropriate resource id.
   * @param url
   * @param accessToken
   * @param payload
   * @param options
   */
  public async requestResourceWithAbsoluteURL<Response>(
    url: string,
    accessToken: string,
    payload?: string,
    options?: RequestOptions,
  ): Promise<Response> {
    /**
     * @dev Execute request.
     */
    const request = await this.instance.requestResource(url, accessToken, {
      body: payload as string,
      ...options,
    });

    /**
     * @dev Raise error if the request gets error.
     */
    if (Number(request.statusCode) / 400 >= 1) {
      throw new HttpException(
        `${request.statusMessage} ${request.body.toString()}`,
        Number(request.statusCode),
      );
    }

    /**
     * @dev Return response.
     */
    try {
      return JSON.parse(request.body?.toString()) as unknown as Response;
    } catch {
      return (
        (request.body?.toString() as unknown as Response) || ('' as Response)
      );
    }
  }
}
