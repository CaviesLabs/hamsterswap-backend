import { MongoMemoryServer } from 'mongodb-memory-server';
import { RegistryProvider } from './providers/registry.provider';

import { UtilsProvider } from './providers/utils.provider';

let mongod;

export const getMemoryServerMongoUri = async () => {
  mongod = await MongoMemoryServer.create({
    instance: { dbName: new UtilsProvider().randomize() },
  });
  return mongod.getUri();
};

export function getDataSourceConfig(registry: RegistryProvider) {
  const engine = registry.getConfig().DB_ENGINE;
  switch (engine) {
    case 'sqlite':
      return {
        type: 'sqlite' as any,
        database: registry.getConfig().DB_URL,
      };

    default:
      return {
        type: engine,
        url: registry.getConfig().DB_URL,
      };
  }
}
