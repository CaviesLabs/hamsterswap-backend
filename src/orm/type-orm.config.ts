import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
config();

import { RegistryProvider } from '../providers/registry.provider';
import { getDataSourceConfig } from '../helper';

const registry = new RegistryProvider();

export default new DataSource({
  ...getDataSourceConfig(registry),
  entities: ['./src/orm/model/*.model.ts'],
  migrations: ['./src/orm/migrations/*-Migration.ts'],
} as DataSourceOptions);
