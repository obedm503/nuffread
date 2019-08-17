// @ts-check
const { resolve, join } = require('path');
require('dotenv-safe').config({
  path: resolve('.env'),
  sample: resolve('.env.example'),
});
const { SnakeNamingStrategy } = require('./dist/util/snake-case.js');

module.exports = {
  type: 'postgres',
  entities: [join(__dirname, 'src/**/*.entity.ts')],
  migrations: [join(__dirname, 'src/migrations/*.ts')],
  url: process.env.DATABASE_URL,
  extra: {
    ssl: true,
  },
  cli: {
    subscribersDir: join(__dirname, 'src/subscribers'),
    migrationsDir: join(__dirname, 'src/migrations'),
  },
  namingStrategy: new SnakeNamingStrategy(),
};
