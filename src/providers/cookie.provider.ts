import { Injectable } from '@nestjs/common';
import { FastifyReply } from 'fastify';
/**
 * @dev Import deps
 */
import { RegistryProvider } from './registry.provider';

@Injectable()
export class CookieProvider {
  extractFromCookie(req: any) {
    let token = null;

    const registryProvider = new RegistryProvider();
    const hostUri = registryProvider.getConfig().HOST_URI;
    const cookieKey = `${hostUri}_jwt`;

    try {
      if (
        req &&
        req.cookies &&
        req.cookies[cookieKey] &&
        req.unsignCookie(req.cookies[cookieKey]).valid
      ) {
        token = req.unsignCookie(req.cookies[cookieKey]).value;
      }
    } catch {}

    return token;
  }

  persistCookie(
    { key, value }: { key: string; value: string },
    response: FastifyReply,
  ) {
    const registryProvider = new RegistryProvider();
    const domain = registryProvider.getConfig().DOMAIN;
    const hostUri = registryProvider.getConfig().HOST_URI;
    const cookieKey = `${hostUri}_${key}`;

    if (registryProvider.getConfig().NODE_ENV !== 'test') {
      response.setCookie(cookieKey, value, {
        domain,
        secure: true,
        signed: true,
        path: '/',
        sameSite: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        expires: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      });
    }
  }

  clearCookie({ key }: { key: string }, response: FastifyReply) {
    const registryProvider = new RegistryProvider();
    const domain = registryProvider.getConfig().DOMAIN;
    const hostUri = registryProvider.getConfig().HOST_URI;
    const cookieKey = `${hostUri}_${key}`;

    if (registryProvider.getConfig().NODE_ENV !== 'test') {
      response.clearCookie(cookieKey, {
        domain,
        secure: true,
        signed: true,
        path: '/',
        sameSite: true,
      });
    }
  }
}
