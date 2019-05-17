// @ts-check
const { resolve } = require('path');
require('dotenv-safe').config({
  path: resolve('./api/.env'),
  example: resolve('./api/.env.example'),
});

const { execSync } = require('child_process');
const { EOL } = require('os');
const { concurrent, series, crossEnv, rimraf } = require('nps-utils');

const parcelConfig = [
  'web/src/client/index.html',
  '--out-dir web/dist/public',
  '--public-url /',
].join(' ');

const buildTypes = [
  'gql2ts',
  'api/types.gql',
  '--output-file types.d.ts',
  `--external-options ${resolve('./gql2tsrc.js')}`,
].join(' ');

// based on https://stackoverflow.com/a/40178818/4371892
const push = name =>
  [
    `git push https://git.heroku.com/nuffread-${name}-staging.git`,
    `\`git subtree split --prefix ${name} $(git branch | grep \\* | cut -d ' ' -f2)\`:refs/heads/master`,
    '--force',
  ].join(' ');
const deploy = series(
  'sed -i /dist/d .gitignore',
  'git add .',
  'git commit -m "Edit .gitignore to publish"',
  push('web'),
  push('api'),
  'git reset HEAD~',
  'git checkout .gitignore',
);

module.exports.scripts = {
  default: 'nps dev',
  dev: {
    default: series(
      'nps clean',
      concurrent.nps('dev.types', 'dev.server', 'dev.client', 'dev.api'),
    ),
    types: `nodemon --watch "api/types.gql" --exec "${buildTypes}"`,
    server: [
      'nodemon',
      '--watch "web/src/app"',
      '--watch "web/src/server"',
      '--ext ts,tsx',
      '--exec "ts-node --project web/src/server/tsconfig.json --pretty --files web/src/server/main"',
    ].join(' '),
    client: `parcel watch ${parcelConfig}`,
    api: [
      'nodemon',
      '--watch api/src',
      '--ext ts',
      '--exec "ts-node --project api/tsconfig.json --pretty --files api/src/main"',
    ].join(' '),
  },
  build: {
    default: series(
      'nps clean',
      buildTypes,
      concurrent.nps('build.client', 'build.server', 'build.api'),
    ),
    client: crossEnv(
      [
        'NODE_ENV=production',
        execSync('heroku config --shell --app nuffread-web-staging')
          .toString()
          .split(EOL)
          .join(' '),
        `parcel build ${parcelConfig} --no-cache`,
      ].join(' '),
    ),
    server: crossEnv(
      'NODE_ENV=production tsc --project web/src/server/tsconfig.json --outDir web/dist',
    ),
    api: crossEnv(
      'NODE_ENV=production tsc --project api/tsconfig.json --outDir api/dist',
    ),
  },
  deploy,
  clean: rimraf('web/dist .cache api/dist'),
  start: {
    server: 'cd web && npm run start',
    api: 'cd api && npm run start',
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
