// @ts-check
const { concurrent, series, rimraf } = require('nps-utils');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load({
    path: './api/.env',
  });
}

module.exports.scripts = {
  default: 'nps dev',
  dev: {
    default: series(
      'nps clean',
      concurrent.nps('dev.types', 'dev.web', 'dev.api'),
    ),
    types: 'graphql-codegen --config codegen.yml --watch',
    web: series('cd web', 'npm run dev'),
    api: series('cd api', 'npm run dev'),
  },
  build: {
    default: series(
      'nps clean',
      'nps build.types',
      concurrent.nps('build.web', 'build.api'),
    ),
    types: 'graphql-codegen --config codegen.yml',
    web: series('cd web', 'npm run build'),
    api: series('cd api', 'npm run build'),
  },
  clean: rimraf('.cache web/build api/dist'),
  start: {
    default: concurrent.nps('start.api', 'start.web'),
    api: series('cd api', 'npm run start'),
    web: series('cd web', 'npm run start'),
  },
  db: {
    info: [
      'psql',
      `--command="select table_name, column_name, data_type, is_nullable from information_schema.columns where table_schema = 'public' and column_name != 'created_at' and column_name != 'updated_at' order by table_name, column_name;"`,
      process.env.DATABASE_URL,
    ].join(' '),
    cli: `psql ${process.env.DATABASE_URL}`,
    migrate: series('cd api', 'npm run migrate'),
  },
};
