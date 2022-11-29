export class TestState {
  keypair: {
    sign: (message: string) => string;
    privateKey: Uint8Array;
    walletAddress: string;
  };

  ownerAddress: string;

  public static get(ctx: any): TestState {
    if (!ctx['state']) {
      ctx['state'] = new TestState();
    }
    return ctx['state'];
  }
}
