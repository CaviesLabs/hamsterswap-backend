import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * @dev Import models.
 */
import { AuthChallengeModel } from './model/auth-challenge.model';
import { AuthSessionModel } from './model/auth-session.model';

import { ExtendedSessionModel } from './model/extended-session.model';
import { EnabledIdpModel } from './model/enabled-idp.model';
import { UserModel } from './model/user.model';
import { SwapItemModel } from './model/swap-item.model';
import { SwapOptionModel } from './model/swap-option.model';
import { SwapProposalModel } from './model/swap-proposal.model';

@Module({
  /**
   * @dev Declare models for the system to inject.
   */
  imports: [
    /**
     * @dev Use forFeature to declare models.
     */
    TypeOrmModule.forFeature([
      AuthSessionModel,
      AuthChallengeModel,
      ExtendedSessionModel,
      EnabledIdpModel,
      UserModel,
      SwapItemModel,
      SwapOptionModel,
      SwapProposalModel,
    ]),
  ],
  exports: [
    /**
     * @dev Need to re-export again the Mongoose module for re-use in other modules.
     */
    TypeOrmModule,
  ],
})
export class OrmModule {}
