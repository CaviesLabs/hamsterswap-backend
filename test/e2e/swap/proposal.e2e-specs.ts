import { HttpStatus } from '@nestjs/common';
import { expect } from 'chai';
import * as request from 'supertest';
import { EntityManager } from 'typeorm';

import { SwapProposalModel } from '../../../src/orm/model/swap-proposal.model';
import { TestState } from '../state.suite';
import { testHelper } from '../test-entrypoint.e2e-spec';

export async function retrieveProposalByOwnerAddress(this: Mocha.Context) {
  const app = testHelper.app;
  const state = TestState.get(this);

  // Precondition 1: Having a ownerAddress
  const entityManager = await app.resolve(EntityManager);
  const { ownerAddress } = await entityManager
    .getRepository(SwapProposalModel)
    .findOne({});
  state.ownerAddress = ownerAddress;

  console.log({ ownerAddress });

  // Step 1: Call find proposals
  const findProposalResponse = await request(app.getHttpServer())
    .get('/api/auth/challenge/request')
    .query({
      ownerAddresses: [state.ownerAddress],
    })
    .send();

  console.log({ body: findProposalResponse.body });

  expect(findProposalResponse.status).to.equal(HttpStatus.OK);
  expect(findProposalResponse.body).to.be.an('array');
  for (const proposal of findProposalResponse.body) {
    expect(proposal.ownerAddress).to.be.a('string');
    expect(proposal.offerItems).to.be.an('array');
    expect(proposal.swapOptions).to.be.an('array');
    expect(proposal.expireAt).to.be.an('Date');
    expect(proposal.status).to.be.oneOf([
      'SWAP_PROPOSAL_STATUS::CREATED',
      'SWAP_PROPOSAL_STATUS::SETTLED',
    ]);
  }
}

describe('retrieve proposals', async function () {
  it(
    'Retrieve proposal by ownerAddress',
    retrieveProposalByOwnerAddress.bind(this),
  );
});
