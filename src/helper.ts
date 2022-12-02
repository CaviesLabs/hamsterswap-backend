import { DataType, newDb } from 'pg-mem';
import { DataSource, DataSourceOptions } from 'typeorm';
import { v4 } from 'uuid';

import { RegistryProvider } from './providers/registry.provider';

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

export async function getTestDataSource(
  config: DataSourceOptions,
): Promise<DataSource> {
  const db = newDb({
    autoCreateForeignKeyIndices: true,
  });

  db.public.registerFunction({
    implementation: () => 'test',
    name: 'current_database',
  });

  db.registerExtension('uuid-ossp', (schema) => {
    schema.registerFunction({
      name: 'uuid_generate_v4',
      returns: DataType.uuid,
      implementation: v4,
      impure: true,
    });
  });

  db.public.registerFunction({
    name: 'version',
    implementation: () =>
      'PostgreSQL 14.2, compiled by Visual C++ build 1914, 64-bit',
  });

  const ds: DataSource = await db.adapters.createTypeormDataSource(config);
  return ds.initialize();
}
