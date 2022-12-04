import { Swap } from './swap.idl';
import { IdlTypes, Program } from '@project-serum/anchor';

// Types

export type OCSwapItem = IdlTypes<Swap>['SwapItem'];

export type OCSwapOption = IdlTypes<Swap>['SwapOption'];

// Accounts

export type OCSwapPlatformRegistry = Awaited<
  ReturnType<Program<Swap>['account']['swapPlatformRegistry']['fetch']>
>;

export type OCSwapProposal = Awaited<
  ReturnType<Program<Swap>['account']['swapProposal']['fetch']>
>;
