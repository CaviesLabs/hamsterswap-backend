import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @dev Route handler parameter decorator.
 * Extract the current authorized session data.
 */
export const CurrentSession = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    let request;
    switch (ctx.getType()) {
      case 'http':
        request = ctx.switchToHttp().getRequest();
        break;
      case 'ws':
        request = ctx.switchToWs().getClient();
        break;
    }

    return request.user;
  },
);
