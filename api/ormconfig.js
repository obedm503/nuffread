// @ts-check
const { resolve } = require('path');
require('dotenv-safe').config({
  path: resolve('.env'),
  sample: resolve('.env.example'),
});
const { SnakeNamingStrategy } = require('./dist/util/snake-case.js');

/** @type {import('typeorm').ConnectionOptions} */
module.exports = {
  type: 'postgres',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  cli: {
    subscribersDir: 'src/subscribers',
    migrationsDir: 'src/migrations',
  },
  namingStrategy: new SnakeNamingStrategy(),
};
