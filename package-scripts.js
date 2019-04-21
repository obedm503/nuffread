// @ts-check
const { resolve } = require('path');
require('dotenv-safe').config({
  path: resolve('./api/.env'),
  example: resolve('./api/.env.example'),
});

const { execSync } = require('child_process');
const { EOL } = require('os');
const { concurrent, series, crossEnv, rimraf } = require('nps-utils');

const buildTypes = [
  'gql2ts',
  'api/schema.gql',
  '--output-file schema.gql.ts',
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
      concurrent.nps('dev.types', 'dev.web', 'dev.api'),
    ),
    types: `nodemon --watch "api/schema.gql" --exec "${buildTypes}"`,
    web: series('cd web', 'npm run start'),
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
      concurrent.nps('build.web', 'build.api'),
    ),
    web: series(
      'cd web',
      crossEnv(
        [
          'NODE_ENV=production',
          execSync('heroku config --shell --app nuffread-web-staging')
            .toString()
            .split(EOL)
            .join(' '),
          'npm run build',
        ].join(' '),
      ),
    ),
    api: crossEnv(
      'NODE_ENV=production tsc --project api/tsconfig.json --outDir api/dist',
    ),
  },
  deploy,
  clean: rimraf('web/dist .cache api/dist'),
  start: {
    api: 'cd api && npm run start',
  },
  db: {
    info: [
      'psql',
      `--command="select table_name, column_name, data_type, is_nullable from information_schema.columns where table_schema = 'public' and column_name != 'created_at' and column_name != 'updated_at' order by table_name, column_name;"`,
      process.env.DATABASE_URL,
    ].join(' '),
    cli: `psql ${process.env.DATABASE_URL}`,
  },
};
