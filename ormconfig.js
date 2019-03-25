// @ts-check
const { resolve } = require('path');
require('dotenv-safe').config({
  path: resolve('api/.env'),
  sample: resolve('api/.env.example'),
});

module.exports = {
  entities: 'api/src/**/*.entity.ts',
  migrations: 'api/src/migrations/*.ts',
  url: process.env.DATABASE_URL,
  cli: {
    subscribersDir: 'api/src/subscribers',
    migrationsDir: 'api/src/migrations',
  },
};
