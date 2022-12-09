import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { expect } from 'chai';

import { testHelper } from '../test-entrypoint.e2e-spec';
import { SolanaSignatureData } from '../../../src/providers/idp/solana-wallet-idp.provider';
import { TestState } from '../state.suite';
import { SolanaWalletSignatureDto } from '../../../src/user/dto/wallet-signature.dto';
import { MEMO_TEXT } from '../../../src/auth/entities/auth-challenge.entity';

export async function shouldSignUpSucceedWithSolanaWallet(this: Mocha.Context) {
  const app = testHelper.app;
  const state = TestState.get(this);

  const keypair = testHelper.createSolanaKeyPair();
  state.keypair = keypair;

  // Step 1: check account availability
  const checkWalletAvailabilityResponse = await request(app.getHttpServer())
    .post(`/api/user/idp/${'solana-wallet'}/availability/check`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send({
      identityId: keypair.walletAddress,
    });

  expect(checkWalletAvailabilityResponse.status).to.equal(
    HttpStatus.NO_CONTENT,
  );

  // Step 2: request auth challenge
  const authChallengeResponse = await request(app.getHttpServer())
    .post('/api/auth/challenge/request')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send({
      target: keypair.walletAddress,
    });

  expect(authChallengeResponse.statusCode).to.equal(HttpStatus.CREATED);
  expect(authChallengeResponse.body.target).to.equal(keypair.walletAddress);
  expect(authChallengeResponse.body.memo).to.be.a('string').to.equal(MEMO_TEXT);
  expect(new Date(authChallengeResponse.body.expiryDate))
    .to.be.a('Date')
    .to.greaterThan(new Date());
  expect(authChallengeResponse.body.isResolved).to.equal(false);
  expect(authChallengeResponse.body.durationDelta).to.equal(60);

  // Step 3: Sign data & encode base64 then call sign-up
  const signatureData = {
    desiredWallet: keypair.walletAddress,
    rawContent: authChallengeResponse.body.memo,
    signature: keypair.sign(authChallengeResponse.body.memo),
  } as SolanaSignatureData;
  const signatureDataBase64 = btoa(JSON.stringify(signatureData));

  const signUpResponse = await request(app.getHttpServer())
    .post(`/api/auth/idp/${'solana-wallet'}/sign-up`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send({
      base64Signature: signatureDataBase64,
    });

  expect(signUpResponse.statusCode).to.equal(HttpStatus.CREATED);
  expect(signUpResponse.body.accessToken).to.be.a('string');

  state.accessToken = signUpResponse.body.accessToken;
  console.log(state.accessToken);
}

export async function shouldSigninSucceedWithSolanaWallet(this: Mocha.Context) {
  const app = testHelper.app;

  const state = TestState.get(this);

  // Precondition: Sign-up succeed
  await shouldSignUpSucceedWithSolanaWallet.bind(this)();

  // Step 1: request auth challenge
  const authChallengeResponse = await request(app.getHttpServer())
    .post('/api/auth/challenge/request')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send({
      target: state.keypair.walletAddress,
    });

  expect(authChallengeResponse.statusCode).to.equal(HttpStatus.CREATED);
  expect(authChallengeResponse.body.target).to.equal(
    state.keypair.walletAddress,
  );
  expect(authChallengeResponse.body.memo).to.be.a('string');
  expect(new Date(authChallengeResponse.body.expiryDate))
    .to.be.a('Date')
    .to.greaterThan(new Date());
  expect(authChallengeResponse.body.isResolved).to.equal(false);
  expect(authChallengeResponse.body.durationDelta).to.equal(60);

  // Step 3: Sign data & encode base64 then call sign-up
  const signatureData: SolanaWalletSignatureDto = {
    desiredWallet: state.keypair.walletAddress,
    signature: state.keypair.sign(authChallengeResponse.body.memo),
  };
  const signatureDataBase64 = btoa(JSON.stringify(signatureData));

  const signInResponse = await request(app.getHttpServer())
    .post(`/api/auth/idp/${'solana-wallet'}/sign-in`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send({
      base64Signature: signatureDataBase64,
    });

  expect(signInResponse.statusCode).to.equal(HttpStatus.CREATED);
  expect(signInResponse.body.accessToken).to.be.a('string');
}

describe('[IDP Auth] sign-up', async function () {
  it(
    'Should signup succeed with Solana wallet',
    shouldSignUpSucceedWithSolanaWallet,
  );
});

describe('[IDP Auth] sign-in', async function () {
  it(
    'Should signin succeed with Solana wallet',
    shouldSigninSucceedWithSolanaWallet,
  );
});
