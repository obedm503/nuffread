const production = process.env.NODE_ENV === 'production';
const { join, resolve } = require('path');
require('dotenv-safe').config({
  path: production ? undefined : resolve(__dirname, '../.env'),
  example: resolve(__dirname, '../.env.example'),
});
require('isomorphic-fetch');
require('reflect-metadata');

import { ApolloServer, ApolloError } from 'apollo-server-express';
import * as pgSession from 'connect-pg-simple';
import * as express from 'express';
import * as session from 'express-session';
import { promisify } from 'util';
import { getContext, getEntities, getSchema } from './schema';
import { logger } from './util';
import * as db from './util/db';
import { BadRequest, InternalError } from './util/error';

const ORIGIN = process.env.ORIGIN || 'https://www.nuffread.com';
const Store = pgSession(session);

const app = express()
  .disable('etag')
  .disable('x-powered-by')
  .set('trust proxy', true)
  .use(
    session({
      secret: process.env.SECRET!,
      resave: false,
      saveUninitialized: false,
      name: 'session',
      store: new Store({
        conObject: {
          connectionString: process.env.DATABASE_URL,
          ssl: true,
        },
      }),
    }),
  );

if (production) {
  // force ssl
  app.use((req, res, next) => {
    if (
      req.hostname === 'localhost' ||
      req.header('x-forwarded-proto') === 'https'
    ) {
      return next();
    }
    res.redirect(301, join(`https://${req.hostname}`, req.url));
  });
}

const port = Number(process.env.PORT) || 8081;

const apollo = new ApolloServer({
  context: ({ req, res }) => {
    const { operationName, variables, query } = req.body;
    logger.info({
      operationName,
      variables,
    });
    logger.debug(query);

    return getContext({ req, res });
  },
  schema: getSchema(),
  formatError(e) {
    const { message, path, extensions, originalError } = e;
    logger.error({ message, path });

    if (!production) {
      return e;
    }

    if (extensions && extensions.code === 'BAD_USER_INPUT') {
      return new BadRequest();
    }

    if (originalError instanceof ApolloError) {
      return e;
    }

    return new InternalError();
  },
});

apollo.applyMiddleware({
  app,
  path: '/',
  cors: {
    credentials: true,
    origin: production ? ORIGIN : true,
  },
});

(async () => {
  const con = await db.connect(getEntities());

  // await con.undoLastMigration();
  // run pending migrations
  await con.runMigrations({ transaction: true });
  // await con.synchronize();

  const server = app.listen(port, () => {
    logger.info('start server');
    logger.debug(`listening on port ${port}`);
  });

  const close = async () => {
    await db.close();
    logger.info('close server');
    await promisify(server.close).call(server);
  };
  process.once('exit', close);
  process.once('SIGUSR2', async () => {
    await close();
    process.kill(process.pid, 'SIGUSR2');
  });
})().catch(e => logger.fatal(e));
