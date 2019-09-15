// @ts-check
const { resolve, join } = require('path');
require('dotenv-safe').config({
  path: resolve('.env'),
  sample: resolve('.env.example'),
});
const { SnakeNamingStrategy } = require('./dist/util/snake-case.js');

module.exports = {
  type: 'postgres',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  url: process.env.DATABASE_URL,
  extra: {
    ssl: true,
  },
  cli: {
    subscribersDir: 'src/subscribers',
    migrationsDir: 'src/migrations',
  },
  namingStrategy: new SnakeNamingStrategy(),
};
