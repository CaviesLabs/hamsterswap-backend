import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AllExceptionsFilter } from './exception.filter';
import { getDataSourceConfig } from './helper';
import { RegistryProvider } from './providers/registry.provider';

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
    TypeOrmModule.forRootAsync({
      /**
       * @dev need to override the useFactory
       */
      useFactory: async () => {
        /**
         * @dev Return the uri.
         */
        return {
          ...getDataSourceConfig(new RegistryProvider()),
          migrations: [__dirname + '/orm/migrations/*-Migration.{ts,js}'],
          synchronize: false,
          migrationsRun: true,
        };
      },
    }),
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
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
