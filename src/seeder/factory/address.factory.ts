import { Keypair } from '@solana/web3.js';
import { faker } from '@faker-js/faker';

export const ADDRESS_POOL = Array.from({ length: 10 }, () =>
  Keypair.generate().publicKey.toBase58(),
);

export function randomOwnerAddress(): string {
  return faker.helpers.arrayElement(ADDRESS_POOL);
}

export function randomFulfillAddress(ownerAddress: string): string {
  return faker.helpers.arrayElement(
    ADDRESS_POOL.filter((addr) => addr != ownerAddress),
  );
}

export const CONTRACT_ADDRESS_POOL = Array.from({ length: 1 }, () =>
  Keypair.generate().publicKey.toBase58(),
);

export function randomContractAddress(): string {
  return faker.helpers.arrayElement(CONTRACT_ADDRESS_POOL);
}
