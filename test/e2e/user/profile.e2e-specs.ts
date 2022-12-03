import { HttpStatus } from '@nestjs/common';
import { expect } from 'chai';
import * as request from 'supertest';

import { shouldSignUpSucceedWithSolanaWallet } from '../auth/idp-auth.e2e-specs';
import { TestState } from '../state.suite';
import { testHelper } from '../test-entrypoint.e2e-spec';

export async function shouldGetUserProfileSucceed(this: Mocha.Context) {
  const app = testHelper.app;
  const state = TestState.get(this);

  // Precondition: Sign-up succeed
  await shouldSignUpSucceedWithSolanaWallet.bind(this)();

  // Step 1: Call get profile
  const getUserProfileResponse = await request(app.getHttpServer())
    .get(`/api/user/profile`)
    .auth(state.accessToken, { type: 'bearer' });

  expect(getUserProfileResponse.status).to.equal(HttpStatus.OK);
  expect(Object.keys(getUserProfileResponse.body).length).to.equal(5);
  expect(getUserProfileResponse.body.id).to.be.a('string');
  expect(getUserProfileResponse.body.avatar).to.be.a('string');
  expect(getUserProfileResponse.body.walletAddress).to.be.a('string');
  expect(getUserProfileResponse.body.telegram).to.be.a('string');
  expect(getUserProfileResponse.body.twitter).to.be.a('string');
}

describe('[User] profile', function () {
  it('Should get user profile succeed', shouldGetUserProfileSucceed);
});
