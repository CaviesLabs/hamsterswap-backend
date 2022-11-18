/**
 * @dev Import native libraries
 */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';

/**
 * @dev Import modules
 */
import { AppModule } from '../src/app.module';
import { globalApply } from '../src/main';

/**
 * @dev import helper
 */
import { getMemoryServerMongoUri } from '../src/helper';

/**
 * @dev Test helper to setup fixtures and other helpers.
 */
export class TestHelper {
  public app: INestApplication;
  public moduleFixture: TestingModule;

  /**
   * @dev Should clean test db
   * @private
   */
  private async cleanTestDb(): Promise<void> {
    return new Promise(async (resolve) => {
      /* Connect to the DB */
      mongoose.connect(await getMemoryServerMongoUri(), async function () {
        /* Drop the DB */
        await mongoose.connection.db.dropDatabase();
        resolve();
      });
    });
  }

  /**
   * @dev Boot the app
   */
  public async bootTestingApp() {
    await this.cleanTestDb();

    this.moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = this.moduleFixture.createNestApplication();
    await globalApply(this.app);

    await this.app.init();

    // import fixtures
    await this.applyFixtures();
  }

  /**
   * @dev Shutdown app
   */
  public async shutDownTestingApp() {
    await this.moduleFixture.close();
    await this.app.close();
    await mongoose.connection.close();
  }

  /**
   * @dev Support creating evm keypair.
   * @param keyPair
   */
  public createEvmKeyPair(
    keyPair: { walletAddress: string; privateKey: string } = null,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Web3 = require('web3');
    const w3 = new Web3();
    let account = w3.eth.accounts.create();

    if (keyPair) {
      account = w3.eth.accounts.privateKeyToAccount(keyPair.privateKey);
    }

    const sign = (message: string) => {
      return account.sign(message).signature;
    };

    /**
     * @dev Return methods.
     */
    return {
      sign,
      privateKey: account.privateKey,
      walletAddress: account.address,
    };
  }

  /**
   * @dev Get module
   * @param moduleClass
   */
  public getModule<Module>(moduleClass) {
    return this.moduleFixture.get<Module>(moduleClass);
  }

  /**
   * @dev This function to setup fixtures.
   * @private
   */
  private async applyFixtures() {
    console.log('Start import fixtures');
  }
}
