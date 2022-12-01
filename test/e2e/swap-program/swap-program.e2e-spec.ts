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
