import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

/**
 * @dev Import models.
 */
import {
  AuthChallengeModel,
  AuthChallengeSchema,
} from './model/auth-challenge.model';
import {
  AuthSessionModel,
  AuthSessionSchema,
} from './model/auth-session.model';
import {
  TwoFactorsModel,
  TwoFactorsSchema,
} from './model/auth-two-factors.model';
import {
  ExtendedSessionModel,
  ExtendedSessionSchema,
} from './model/extended-session.model';
import { PolicyLockModel, PolicyLockSchema } from './model/policy-lock.model';
import { EnabledIdpModel, EnabledIdpSchema } from './model/enabled-idp.model';
import { PrismaService } from './prisma.service';

@Module({
  /**
   * @dev Declare models for the system to inject.
   */
  imports: [
    /**
     * @dev Use forFeature to declare models.
     */
    MongooseModule.forFeature([
      { name: AuthSessionModel.name, schema: AuthSessionSchema },
      { name: AuthChallengeModel.name, schema: AuthChallengeSchema },
      { name: TwoFactorsModel.name, schema: TwoFactorsSchema },
      { name: ExtendedSessionModel.name, schema: ExtendedSessionSchema },
      { name: PolicyLockModel.name, schema: PolicyLockSchema },
      { name: EnabledIdpModel.name, schema: EnabledIdpSchema },
    ]),
  ],
  providers: [PrismaService],
  exports: [
    /**
     * @dev Need to re-export again the Mongoose module for re-use in other modules.
     */
    MongooseModule,
    PrismaService,
  ],
})
export class OrmModule {}
