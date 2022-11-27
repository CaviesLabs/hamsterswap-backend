import { faker } from '@faker-js/faker';

export const ADDRESS_POOL = Array.from({ length: 10 }, () =>
  faker.finance.ethereumAddress(),
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
  faker.finance.ethereumAddress(),
);

export function randomContractAddress(): string {
  return faker.helpers.arrayElement(CONTRACT_ADDRESS_POOL);
}
