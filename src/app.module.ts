import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getMemoryServerMongoUri } from './helper';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RegistryProvider } from './providers/registry.provider';
import { AuditModule } from './audit/audit.module';
import { AuditGuard } from './audit/audit.guard';
import { AuditActivityInterceptor } from './audit/audit-activity.interceptor';
import { AllExceptionsFilter } from './exception.filter';

@Module({
  imports: [
    /**
     * @dev Still enable config module
     */
    ConfigModule.forRoot(),

    /**
     * @dev Enable rate limit.
     */
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100,
    }),

    /**
     * @dev Enable schedule module.
     */
    ScheduleModule.forRoot(),

    /**
     * @dev Initialize database
     */
    MongooseModule.forRootAsync({
      /**
       * @dev need to override the useFactory
       */
      useFactory: async () => {
        /**
         * @dev Extract env.
         */
        const registry = new RegistryProvider();
        const env = registry.getConfig().NODE_ENV;
        let uri;

        /**
         * @dev For test env we can just use memory server uri.
         */
        if (env === 'test') uri = await getMemoryServerMongoUri();
        else uri = registry.getConfig().MONGO_URL;

        /**
         * @dev Return the uri.
         */
        return {
          uri,
        };
      },
    }),
    /**
     * @dev Import Audit module
     */
    AuditModule,
    /**
     * @dev Import other modules.
     */
    AuthModule,
    UserModule,
  ],
  /**
   * @dev Import controller.
   */
  controllers: [AppController],

  /**
   * @dev Import main service.
   */
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuditGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditActivityInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
