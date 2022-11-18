import { testHelper } from './test-entrypoint.e2e-spec';
import { expect } from 'chai';

describe('[dummy] private key management', () => {
  it('should generate private key successfully', async () => {
    const privateKey = testHelper.createEvmKeyPair();
    expect(!!privateKey.privateKey).to.be.true;
  });
});
