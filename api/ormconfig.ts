import { config } from 'dotenv-safe';
import { resolve } from 'path';
import { ConnectionOptions } from 'typeorm';
import * as entities from './src/entities';
import { SnakeNamingStrategy } from './src/util/snake-case';

config({
  path: resolve('.env'),
  sample: resolve('.env.example'),
});

const ormconfig: ConnectionOptions = {
  type: 'postgres',
  entities: Object.values(entities),
  migrations: ['src/migrations/*'],
  url: process.env.DATABASE_URL,
  cli: {
    subscribersDir: 'src/subscribers',
    migrationsDir: 'src/migrations',
  },
  namingStrategy: new SnakeNamingStrategy(),
};
export default ormconfig;
