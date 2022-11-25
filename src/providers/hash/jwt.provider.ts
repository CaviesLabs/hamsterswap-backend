import { Injectable } from '@nestjs/common';
import { JwtSignOptions } from '@nestjs/jwt';

/**
 * @dev Import deps
 */
import { RegistryProvider } from '../registry.provider';

/**
 * @dev Import 3rd party libs
 */
import { ExtractJwt } from 'passport-jwt';
import * as Jose from 'jose';

/**
 * @dev Export JWT payload for typescript reference.
 */
export class JWTPayload implements Jose.JWTPayload {
  [propName: string]: unknown;
  aud?: string | string[];
  exp?: number;
  iat?: number;
  iss?: string;
  jti?: string;
  nbf?: number;
  sub?: string;
}
export class JwtVerifyOptions implements Jose.JWTVerifyOptions {}

/**
 * @dev JWT operational provider.
 */
@Injectable()
export class JwtProvider {
  /**
   * @dev Assign Jose instance.
   * @private
   */
  private readonly provider: typeof Jose = Jose;

  /**
   * @dev Inject config service so that the provider can inject the env credentials
   * @param registryProvider
   */
  constructor(private registryProvider: RegistryProvider) {}

  /**
   * @dev Access credentials.
   */
  getKeyPair() {
    return {
      privateKey: this.registryProvider.getConfig().PRIVATE_KEY,
      publicKey: this.registryProvider.getConfig().PUBLIC_KEY,
    };
  }

  /**
   * @dev Get verify options.
   */
  public getVerifyOptions() {
    return {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      publicKey: this.getKeyPair().publicKey,
      algorithms: ['RS256'],
    };
  }

  /**
   * @dev Get signing options.
   */
  public getSignOptions(): JwtSignOptions {
    return {
      expiresIn: '7d',
      issuer: this.registryProvider.getConfig().DOMAIN,
      algorithm: 'RS256',
    };
  }

  /**
   * @dev Sign jwt.
   * @param jwtPayload
   */
  public async signJwt(jwtPayload: Jose.JWTPayload): Promise<string> {
    /**
     * @dev construct signer.
     */
    const signer = new this.provider.SignJWT(jwtPayload);

    /**
     * @dev Import private key.
     */
    const privateKey = await this.provider.importPKCS8(
      this.getKeyPair().privateKey,
      this.getSignOptions().algorithm,
    );

    /**
     * @dev Set sign algorithm.
     */
    signer.setProtectedHeader({ alg: this.getSignOptions().algorithm });

    /**
     * @dev Sign JWT with imported private key.
     */
    return signer.sign(privateKey);
  }

  /**
   * @dev Verify JWT using public key.
   * @param jwt
   * @param options
   */
  public async verifyJwt(
    jwt: string,
    options?: JwtVerifyOptions,
  ): Promise<boolean> {
    /**
     * @dev Need to import public key
     */
    const publicKey = await this.provider.importSPKI(
      this.getKeyPair().publicKey,
      this.getVerifyOptions().algorithms[0],
    );

    /**
     * @dev Verify jwt.
     */
    try {
      const res = await Jose.jwtVerify(jwt, publicKey, {
        algorithms: this.getVerifyOptions().algorithms,
        ...options,
      });
      return !!res.payload;
    } catch {
      return false;
    }
  }

  /**
   * @dev Verify JWT using public key.
   * @param jwt
   * @param options
   */
  public async introspect(
    jwt: string,
    options?: JwtVerifyOptions,
  ): Promise<JWTPayload> {
    /**
     * @dev Need to import public key
     */
    const publicKey = await this.provider.importSPKI(
      this.getKeyPair().publicKey,
      this.getVerifyOptions().algorithms[0],
    );

    /**
     * @dev Verify jwt.
     */
    const { payload } = await Jose.jwtVerify(jwt, publicKey, {
      algorithms: this.getVerifyOptions().algorithms,
      ...options,
    });
    return payload;
  }
}
