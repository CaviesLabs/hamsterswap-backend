import { randomUUID } from 'crypto';

export function isIdsMatched(onChainId: string, id: string): boolean {
  return onChainId === id.slice(0, 10);
}

export function toUUIDv4(onChainId: string): string {
  return onChainId + randomUUID().slice(10);
}
