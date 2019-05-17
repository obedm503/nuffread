// @ts-check
const { resolve } = require('path');
require('dotenv-safe').config({
  path: resolve('.env'),
  sample: resolve('.env.example'),
});

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
};
