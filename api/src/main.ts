const production = process.env.NODE_ENV === 'production';
const { join, resolve } = require('path');
require('dotenv-safe').config({
  path: production ? undefined : resolve(__dirname, '../.env'),
  example: resolve(__dirname, '../.env.example'),
});
require('isomorphic-fetch');
require('reflect-metadata');

import { ApolloServer } from 'apollo-server-express';
import * as pgSession from 'connect-pg-simple';
import * as express from 'express';
import * as session from 'express-session';
import { promisify } from 'util';
import { Admin } from './admin/admin.entity';
import { Book } from './book/book.entity';
import { Invite } from './invite/invite.entity';
import { Listing } from './listing/listing.entity';
import { getContext, getSchema } from './schema';
import { School } from './school/school.entity';
import { User } from './user/user.entity';
import { logger } from './util';
import * as db from './util/db';

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
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(301, join(`https://${req.hostname}`, req.url));
    } else {
      next();
    }
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
    const { message, path } = e;
    logger.error({ message, path });
    return e;
  },
});

apollo.applyMiddleware({
  app,
  path: '/',
  cors: {
    credentials: true,
    origin: production
      ? process.env.ORIGIN || 'https://www.nuffread.com'
      : true,
  },
});

(async () => {
  const con = await db.connect([User, School, Admin, Listing, Book, Invite]);

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
