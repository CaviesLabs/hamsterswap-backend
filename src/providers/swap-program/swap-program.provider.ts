import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';

import { Swap, IDL } from './swap.idl';
import { RegistryProvider } from '../registry.provider';
import { OCSwapPlatformRegistry, OCSwapProposal } from './swap.type';

export const SOLANA_DEVNET_RPC_ENDPOINT = 'https://api.devnet.solana.com';
export const SOLANA_MAINNET_RPC_RPC_ENDPOINT =
  'https://solana-rpc.hamsterbox.xyz/';

/**
 * @dev Swap Program Provider acts as an interface to interact with hamsterswap program on solana.
 */
export class SwapProgramProvider {
  private readonly idl: Swap = IDL;
  private readonly rpcEndpoint: string;
  private readonly programId: string;

  /**
   * @dev This is to indicate whether the program is initialized or not.
   * @private
   */
  private program: Program<Swap>;
  private isProgramInitialize = false;

  /**
   * @dev Initialize swap program provider.
   */
  constructor() {
    const registry = new RegistryProvider();

    /**
     * @dev Binding cluster
     */
    switch (registry.getConfig().SOLANA_CLUSTER) {
      case 'devnet':
        this.rpcEndpoint = SOLANA_DEVNET_RPC_ENDPOINT;
        break;
      case 'mainnet':
        this.rpcEndpoint = SOLANA_MAINNET_RPC_RPC_ENDPOINT;
        break;
      default:
        throw new Error('RPC not supported');
    }

    /**
     * @dev Binding program id
     */
    this.programId = registry.getConfig().SWAP_PROGRAM_ADDRESS;

    /**
     * @dev Initialize program
     */
    this.getSwapProgram().then((program) => {
      this.program = program;
      this.isProgramInitialize = true;
    });
  }

  /**
   * @dev Initialize program
   * @private
   */
  private async getSwapProgram() {
    /**
     * @dev Skip initialization if the program was initialized.
     */
    if (this.program) {
      return this.program;
    }

    /**
     * @dev Prepares for some infra config
     */
    const connection = new Connection(this.rpcEndpoint, 'processed');
    const defaultKeyPair = Keypair.generate();
    const senderWallet = new NodeWallet(defaultKeyPair);
    const provider = new anchor.AnchorProvider(connection, senderWallet, {
      preflightCommitment: 'processed',
      commitment: 'processed',
    });

    /**
     * @dev Now we create program instance
     */
    this.program = new Program<Swap>(this.idl, this.programId, provider);

    /**
     * @dev Return the program again.
     */
    return this.program;
  }

  /**
   * @dev Return swap proposal with proposal id
   * @param proposalId
   */
  public async getSwapProposal(proposalId: string): Promise<OCSwapProposal> {
    const program = await this.getSwapProgram();
    const [swapProposalPublicKey] = PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode('SEED::SWAP::PROPOSAL_SEED'),
        anchor.utils.bytes.utf8.encode(proposalId.slice(0, 10)),
      ],
      program.programId,
    );

    return program.account.swapProposal.fetch(swapProposalPublicKey);
  }

  /**
   * @dev Return the swap registry.
   */
  public async getSwapConfig(): Promise<OCSwapPlatformRegistry> {
    const program = await this.getSwapProgram();

    // find the swap account
    const [swapAccountPublicKey] = PublicKey.findProgramAddressSync(
      [anchor.utils.bytes.utf8.encode('SEED::SWAP::PLATFORM')],
      program.programId,
    );

    return program.account.swapPlatformRegistry.fetch(swapAccountPublicKey);
  }
}
