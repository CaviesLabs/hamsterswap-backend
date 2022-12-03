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

  expect(getUserProfileResponse.body).to.have.property('id');
  expect(getUserProfileResponse.body).to.have.property('createdAt');
  expect(getUserProfileResponse.body).to.have.property('updatedAt');
  expect(getUserProfileResponse.body).to.have.property('deletedAt');
  expect(getUserProfileResponse.body).to.have.property('email');
  expect(getUserProfileResponse.body).to.have.property('emailVerified');
  expect(getUserProfileResponse.body).to.have.property('birthday');
  expect(getUserProfileResponse.body).to.have.property('displayName');
  expect(getUserProfileResponse.body).to.have.property('avatar');
  expect(getUserProfileResponse.body).to.have.property('roles');
  expect(getUserProfileResponse.body).to.have.property('groups');
  expect(getUserProfileResponse.body).to.have.property('telegram');
  expect(getUserProfileResponse.body).to.have.property('twitter');
  expect(getUserProfileResponse.body).to.have.property('walletAddress');
}

describe('[User] profile', function () {
  it('Should get user profile succeed', shouldGetUserProfileSucceed);
});
