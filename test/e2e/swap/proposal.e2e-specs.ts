import { HttpStatus } from '@nestjs/common';
import { expect } from 'chai';
import * as request from 'supertest';
import { EntityManager } from 'typeorm';

import { SwapProposalModel } from '../../../src/orm/model/swap-proposal.model';
import { TestState } from '../state.suite';
import { testHelper } from '../test-entrypoint.e2e-spec';
import { shouldSignUpSucceedWithSolanaWallet } from '../auth/idp-auth.e2e-specs';
import { UpdateSwapProposalAdditionsDto } from '../../../src/swap/dto/update-proposal.dto';
import { SwapProposalStatus } from '../../../src/swap/entities/swap-proposal.entity';

export async function shouldRetrieveProposalByOwnerAddress(
  this: Mocha.Context,
) {
  const app = testHelper.app;

  // Precondition 1: Having a ownerAddress
  const entityManager = await app.resolve(EntityManager);
  const { ownerAddress } = await entityManager
    .getRepository(SwapProposalModel)
    .findOne({ where: {} });

  // Step 1: Call find proposals
  const findProposalResponse = await request(app.getHttpServer())
    .get(`/api/proposal`)
    .query({
      ownerAddresses: [ownerAddress],
    })
    .send();

  expect(findProposalResponse.status).to.equal(HttpStatus.OK);

  expect(findProposalResponse.body).to.be.an('array');
  for (const proposal of findProposalResponse.body) {
    expect(proposal.ownerAddress).to.be.a('string');
    expect(proposal.offerItems).to.be.an('array');
    expect(proposal.swapOptions).to.be.an('array');
    expect(new Date(proposal.expireAt)).to.be.an('Date');
    expect(proposal.status).to.be.oneOf([
      SwapProposalStatus.CREATED,
      SwapProposalStatus.DEPOSITED,
      SwapProposalStatus.FULFILLED,
      SwapProposalStatus.CANCELED,
    ]);
  }
}

export async function shouldRetrieveProposalById(this: Mocha.Context) {
  const app = testHelper.app;

  // Precondition 1: Having a proposal id
  const entityManager = await app.resolve(EntityManager);
  const { id } = await entityManager
    .getRepository(SwapProposalModel)
    .findOne({ where: {} });

  // Step 1: Call find proposals
  const findProposalResponse = await request(app.getHttpServer())
    .get(`/api/proposal/${id}`)
    .send();

  expect(findProposalResponse.status).to.equal(HttpStatus.OK);
  expect(findProposalResponse.body.ownerAddress).to.be.a('string');
  expect(findProposalResponse.body.offerItems).to.be.an('array');
  expect(findProposalResponse.body.swapOptions).to.be.an('array');
  expect(new Date(findProposalResponse.body.expireAt)).to.be.an('Date');
  expect(findProposalResponse.body.status).to.be.oneOf([
    SwapProposalStatus.CREATED,
    SwapProposalStatus.DEPOSITED,
    SwapProposalStatus.FULFILLED,
    SwapProposalStatus.CANCELED,
  ]);
}

export async function shouldCreateEmptyProposal(this: Mocha.Context) {
  const app = testHelper.app;
  const state = TestState.get(this);
  // Precondition: Sign-up succeed
  await shouldSignUpSucceedWithSolanaWallet.bind(this)();

  // Step 1: Call create empty proposal API
  const createSwapProposalDto = {
    expireAt: new Date().toISOString(),
    note: 'This can be omit or empty',
  };

  const createProposalResponse = await request(app.getHttpServer())
    .post(`/api/proposal`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .auth(state.accessToken, { type: 'bearer' })
    .send(createSwapProposalDto);

  expect(createProposalResponse.status).to.equal(HttpStatus.CREATED);
  expect(createProposalResponse.body.id).to.be.a('string');
  expect(createProposalResponse.body.ownerId).to.be.a('string');
  expect(createProposalResponse.body.ownerAddress).to.be.a('string');
  expect(new Date(createProposalResponse.body.expireAt)).to.be.a('date');
  expect(createProposalResponse.body.note).to.be.a('string');
  expect(createProposalResponse.body.status).to.equal(
    SwapProposalStatus.CREATED,
  );

  state.proposalId = createProposalResponse.body.id;
}

export async function shouldUpdateProposalAdditions(this: Mocha.Context) {
  const app = testHelper.app;
  const state = TestState.get(this);
  // Precondition 1: Sign-up succeed
  await shouldSignUpSucceedWithSolanaWallet.bind(this)();

  // Precondition 2: A proposal created
  await shouldCreateEmptyProposal.bind(this)();

  // Step 1: Call update proposal additions
  const updateProposalAdditionsDto = {
    note: 'this can be omit or empty',
  } as UpdateSwapProposalAdditionsDto;

  const updateProposalResponse = await request(app.getHttpServer())
    .patch(`/api/proposal/${state.proposalId}/additions`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .auth(state.accessToken, { type: 'bearer' })
    .send(updateProposalAdditionsDto);

  expect(updateProposalResponse.status).to.equal(HttpStatus.OK);
  expect(updateProposalResponse.body.note).to.equal(
    updateProposalAdditionsDto.note,
  );
}

describe('retrieve proposals', async function () {
  it(
    'Should retrieve proposal by ownerAddress',
    shouldRetrieveProposalByOwnerAddress,
  );
  it('Should retrieve proposal by id', shouldRetrieveProposalById);
  it('Should create empty proposal', shouldCreateEmptyProposal);
  it('Should update proposal additions', shouldUpdateProposalAdditions);
});
