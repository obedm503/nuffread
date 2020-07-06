import { config } from 'dotenv-safe';
import { resolve } from 'path';
import { ConnectionOptions } from 'typeorm';
import * as entities from './src/db/entities';
import { SnakeNamingStrategy } from './src/db/snake-case';

config({
  path: resolve('.env'),
  sample: resolve('.env.example'),
});

const ormconfig: ConnectionOptions = {
  type: 'postgres',
  entities: Object.values(entities),
  migrations: ['src/db/migrations/*'],
  url: process.env.DATABASE_URL,
  cli: {
    // subscribersDir: 'src/subscribers',
    migrationsDir: 'src/db/migrations',
  },
  namingStrategy: new SnakeNamingStrategy(),
};
module.exports = ormconfig;
