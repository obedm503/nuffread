require('./src/server/util/env');

const { concurrent, series, crossEnv, rimraf } = require('nps-utils');
const { resolve } = require('path');
const mkdirp = require('mkdirp');

const parcelConfig = [
  'src/client/index.html',
  '--out-dir dist/public',
  '--public-url /public',
].join(' ');

const buildTypes = [
  'gql2ts',
  'src/server/types.gql',
  '--output-file types.d.ts',
  `--external-options ${resolve('./gql2tsrc.js')}`,
].join(' ');

module.exports.scripts = {
  default: 'nps dev',
  dev: {
    default: series(
      'nps clean',
      concurrent({
        server: 'nps dev.server',
        client: 'nps dev.client',
        types: 'nps dev.types',
        start: 'nps dev.start',
      }),
    ),
    types: [
      'nodemon',
      '--watch "src/server/types.gql"',
      `--exec "${buildTypes}"`,
    ].join(' '),
    server: [
      'tsc',
      '--project src/server/tsconfig.json',
      '--watch',
      '--preserveWatchOutput',
      '--pretty',
    ].join(' '),
    start: [
      'nodemon',
      '--watch "dist/server"',
      '--watch "dist/shared"',
      '--watch ".env"',
      '--delay 2000ms',
      '--exec "node dist/server/main.js"',
    ].join(' '),
    client: `parcel watch ${parcelConfig}`,
  },
  start:
    'node --optimize_for_size --max_old_space_size=512 --gc_interval=100 dist/server/main.js',
  build: {
    default: series('nps build.before', 'nps build.client', 'nps build.server'),
    before: series(
      'nps clean',
      mkdirp.sync('./dist/server/'),
      mkdirp.sync('./dist/shared/'),
      buildTypes,
    ),
    server: crossEnv(
      'NODE_ENV=production tsc --project src/server/tsconfig.json',
    ),
    client: crossEnv(
      `NODE_ENV=production parcel build ${parcelConfig} --no-cache`,
    ),
  },
  clean: rimraf('dist .cache'),
  db: {
    info: [
      'psql',
      `--command="select table_name, column_name, data_type, is_nullable from information_schema.columns where table_schema = 'public' and column_name != 'created_at' and column_name != 'updated_at' order by table_name, column_name;"`,
      process.env.DATABASE_URL,
    ].join(' '),
    cli: `psql ${process.env.DATABASE_URL}`,
  },
};
