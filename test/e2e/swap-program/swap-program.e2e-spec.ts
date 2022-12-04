import { expect } from 'chai';

import { SwapProgramProvider } from '../../../src/providers/swap-program/swap-program.provider';

describe('[swap-program] query swap program via solana rpc', function () {
  it('should: get swap registry state successfully', async () => {
    const programProvider = new SwapProgramProvider();
    const state = await programProvider.getSwapConfig();

    expect(!!state.owner).to.be.true;
    expect(state.wasInitialized).to.be.true;
    expect(state.maxAllowedItems).equals(5);
    expect(state.maxAllowedOptions).equals(5);
  });
});

describe('[swap-program] get swap proposal by id', function () {
  it('should get swap proposal successfully', async function () {
    // const programProvider = new SwapProgramProvider();
    // const proposal = await programProvider.getSwapProposal(
    //   '23600320-eb91-49b4-8d5e-4b9cc63198fe',
    // );
    // expect(proposal).is.exist;
    // expect(proposal).has.property('fulfilledBy');
    // expect(proposal).has.property('fulfilledWithOptionId');
    // expect(proposal).has.property('status');
    // expect(proposal).has.property('offeredItems');
    // expect(proposal).has.property('swapOptions');
    // expect(proposal).has.property('owner');
    // expect(proposal).has.property('expiredAt');
    // TODO: replace hardcode
  });
});
