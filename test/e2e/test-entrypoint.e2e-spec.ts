import { TestHelper } from '../test.helper';

/**
 * @dev Construct helper.
 */
export const testHelper = new TestHelper();

/**
 * @dev Setup before hook.
 */
before(async () => {
  await testHelper.bootTestingApp();
});

/**
 * @dev Setup after hook.
 */
after(async () => {
  await testHelper.shutDownTestingApp();

  /**
   * @dev also send signal to stop the test.
   */
  process.exit(0);
});

/**
 * @dev Require other test here.
 */
require('./wallet.e2e-specs');
require('./auth/idp-auth.e2e-specs');
require('./swap/proposal.e2e-specs');
