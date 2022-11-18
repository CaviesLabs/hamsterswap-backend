import { Injectable } from '@nestjs/common';
import type KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import type UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';

import { UtilsProvider } from '../utils.provider';
import { OpenIDProvider } from './openid.provider';
import { RegistryProvider } from '../registry.provider';

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
 * @dev Provider state.
 */
enum KeycloakProviderState {
  UNINITIALIZED,
  INITIALIZED,
  ERROR,
}

/**
 * @dev User full entity.
 */
export type UserFullEntity = UserRepresentation;

const AUTO_POLLING_MSEC = 5 * 60 * 1000;

/**
 * @dev Keycloak Admin Provider. Used for administration operation.
 */
@Injectable()
export class KeycloakAdminProvider {
  /**
   * @dev Private Keycloak instance.
   * @type {KeycloakAdminClient}
   * @private
   */
  private _instance: KeycloakAdminClient;

  /**
   * @dev Binding Keycloak credential.
   * @type {KeycloakCredential}
   * @private
   */
  private credential: KeycloakCredential;

  /**
   * @dev Indicate that provider is initialized.
   * @type {boolean}
   * @private
   */
  private state: KeycloakProviderState = KeycloakProviderState.UNINITIALIZED;

  /**
   * @dev Initialize Keycloak provider.
   * @param openIdProvider
   * @param {RegistryProvider} registryProvider
   */
  constructor(
    /**
     * @dev Import providers.
     */
    private readonly openIdProvider: OpenIDProvider,

    /**
     * @dev Import services.
     */
    private readonly registryProvider: RegistryProvider,
  ) {
    this.credential = this.loadCredentials();

    /**
     * @dev Initialize keycloak.
     */
    this.initializeKeycloak().then(() => {
      /**
       * @dev Polling re-authentication to make sure the session will be kept continuously.
       */
      new UtilsProvider().withInterval(async () => {
        console.log('Begin re-authentication for Keycloak provider ...');

        /**
         * @dev Start re-authentication
         */
        await this.initializeKeycloak();
      }, AUTO_POLLING_MSEC);
    });
  }

  /**
   * @dev Initialize Keycloak using ESModule syntax.
   * See reference solution #1 here: https://stackoverflow.com/questions/70545129/compile-a-package-that-depends-on-esm-only-library-into-a-commonjs-package.
   * Also need typescript at least 4.8.
   * @private
   */
  private async initializeKeycloak(): Promise<void> {
    const KeycloakAdmin = await KeycloakAdminProvider.getKeycloakModule();

    this._instance = new KeycloakAdmin({
      baseUrl: `${this.credential.AUTH_URL}/auth`,
      realmName: this.credential.AUTH_REALM_NAME,
    });

    /**
     * @dev Authenticate client id and client secret.
     */
    return this._instance
      .auth({
        clientId: this.credential.KEYCLOAK_AUTH_PASSPORT_CLIENT_ID,
        clientSecret: this.credential.KEYCLOAK_AUTH_PASSPORT_CLIENT_SECRET,
        grantType: 'client_credentials',
      })
      .then(() => {
        this.state = KeycloakProviderState.INITIALIZED;
      })
      .catch((e) => {
        console.log(e);
        this.state = KeycloakProviderState.ERROR;
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
   * @dev To get keycloak module with ESModule-to-commonjs syntax.
   * @private
   */
  private static async getKeycloakModule(): Promise<
    typeof import('@keycloak/keycloak-admin-client').default
  > {
    return (
      await (new Function(
        `return import('@keycloak/keycloak-admin-client')`,
      )() as Promise<typeof import('@keycloak/keycloak-admin-client')>)
    ).default;
  }

  /**
   * @dev Keycloak instance getter.
   * @returns {KeycloakAdminClient | null}
   */
  public get instance(): KeycloakAdminClient | null {
    if (this.state === KeycloakProviderState.INITIALIZED) {
      return this._instance;
    }

    throw new Error("KeycloakAdminProvider isn't initialized");
  }

  /**
   * @dev Delete session with id.
   * @param sessionId
   */
  public deleteSession(sessionId: string): Promise<void> {
    /**
     * @dev Delete session.
     */
    return this.openIdProvider.requestResourceWithAbsoluteURL(
      `${this.credential.AUTH_URL}/auth/admin/realms/${this.credential.AUTH_REALM_NAME}/sessions/${sessionId}`,
      this.instance.accessToken,
      '',
      {
        method: 'DELETE',
      },
    );
  }
}
