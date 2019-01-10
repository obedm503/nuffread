require('./src/server/util/env');

module.exports = {
  entities: 'src/server/**/*.entity.ts',
  migrations: 'src/server/migrations/*.ts',
  url: process.env.DATABASE_URL,
  cli: {
    subscribersDir: './src/server/subscribers',
    migrationsDir: './src/server/migrations',
  },
};
