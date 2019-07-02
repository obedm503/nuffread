// @ts-check
const { resolve } = require('path');
require('dotenv-safe').config({
  path: resolve('./api/.env'),
  example: resolve('./api/.env.example'),
});

const { execSync } = require('child_process');
const { EOL } = require('os');
const { concurrent, series, rimraf, copy } = require('nps-utils');

const buildTypes = series(
  [
    'gql2ts',
    'api/schema.gql',
    '--output-file api/src/schema.gql.ts',
    `--external-options ${resolve('./gql2tsrc.js')}`,
  ].join(' '),
  copy('"api/src/schema.gql.ts" web/src/'),
);

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
    web: series('cd web', 'npm run dev'),
    api: series('cd api', 'npm run dev'),
  },
  build: {
    default: series(
      'nps clean',
      buildTypes,
      concurrent.nps('build.web', 'build.api'),
    ),
    types: buildTypes,
    web: series(
      'cd web',
      [
        'node ../node_modules/cross-env/dist/bin/cross-env.js',
        'NODE_ENV=production',
        process.argv.join(' ').includes('build') // only get heroku vars on build
          ? execSync('heroku config --shell --app nuffread-web-staging')
              .toString()
              .split(EOL)
              .join(' ')
          : '',
        'npm run build',
      ].join(' '),
    ),
    api: series('cd api', 'npm run build'),
  },
  deploy,
  clean: rimraf('.cache web/build api/dist'),
  start: {
    api: series('cd api', 'npm run start'),
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
