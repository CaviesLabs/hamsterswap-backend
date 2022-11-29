export class TestState {
  keypair: {
    sign: (message: string) => string;
    privateKey: Uint8Array;
    walletAddress: string;
  };

  public static get(suite: Mocha.Suite): TestState {
    if (!suite['state']) {
      suite['state'] = new TestState();
    }
    return suite['state'];
  }
}
