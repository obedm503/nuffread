// @ts-check
const { concurrent, series, rimraf } = require('nps-utils');
const { lightFormat } = require('date-fns');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv-safe').config({
    path: './api/.env',
    example: './api/.env.example',
  });
}

// sent to mixpanel, serves as a version tag
// formatted to look like 20191103131121
process.env.REACT_APP_VERSION = lightFormat(new Date(), 'yyyyMMddHHmmss');

module.exports.scripts = {
  default: 'nps dev',
  deploy: {
    web: series.nps('clean', 'build.types', 'build.web'),
    api: series.nps('clean', 'build.types', 'build.api'),
    admin: series('nps clean', 'nps build.types', 'cd admin', 'npm run deploy'),
  },
  dev: {
    default: concurrent.nps(
      'dev.types',
      'dev.web',
      'dev.api.start',
      'dev.api.build',
      'dev.admin',
    ),
    types: 'graphql-codegen --config codegen.yml --watch',
    web: series('cd web', 'npm run dev'),
    beta: series('cd beta', 'npm run dev'),
    api: {
      default: concurrent.nps('dev.api.build', 'dev.api.start'),
      build: series('cd api', 'npm run dev:build'),
      start: series('cd api', 'npm run dev:start'),
    },
    admin: series('cd admin', 'npm run dev'),
  },
  build: {
    default: series(
      'nps clean',
      'nps build.types',
      concurrent.nps('build.web', 'build.api', 'build.admin'),
    ),
    types: 'graphql-codegen --config codegen.yml',
    web: series('cd web', 'npm run build'),
    api: series('cd api', 'npm run build'),
    admin: series('cd admin', 'npm run build'),
  },
  clean: rimraf('.cache web/build api/dist'),
  start: {
    default: concurrent.nps('start.api', 'start.web'),
    api: series('cd api', 'npm run start'),
    web: series('cd web', 'npm run start'),
    admin: series('cd admin', 'npm run start'),
  },
  db: {
    info: [
      'psql',
      `--command="select table_name, column_name, data_type, is_nullable from information_schema.columns where table_schema = 'public' and column_name != 'created_at' and column_name != 'updated_at' order by table_name, column_name;"`,
      process.env.DATABASE_URL,
    ].join(' '),
    cli: `psql ${process.env.DATABASE_URL}`,
    // based on https://stackoverflow.com/questions/10673630/how-do-i-transfer-production-database-to-staging-on-heroku-using-pgbackups-gett/24005476#30495448
    prepare: series(
      'heroku maintenance:on --app nuffread-staging',
      'heroku pg:copy nuffread::DATABASE_URL DATABASE_URL --app nuffread-staging --verbose --confirm nuffread-staging',
      'heroku maintenance:off --app nuffread-staging',
    ),
  },
  pretty: 'prettier web/src api/src admin/src --write',
  logs: {
    default:
      'heroku logs -a nuffread -s app -d web -n 5000 | cut -c46- - | grep \'{"level":50\' > heroku.log',
    tail: 'heroku logs -a nuffread -s app -d web -t | cut -c46- -',
  },
};
