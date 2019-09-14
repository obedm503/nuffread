const production = process.env.NODE_ENV === 'production';
const { join, resolve } = require('path');

if (!production) {
  const { config } = require('dotenv-safe');
  config({
    path: resolve(__dirname, '../.env'),
    example: resolve(__dirname, '../.env.example'),
  });
}

require('isomorphic-fetch');
require('reflect-metadata');
import { ApolloServer } from 'apollo-server-express';
import * as pgSession from 'connect-pg-simple';
import * as express from 'express';
import * as session from 'express-session';
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
  app.use((req: express.Request, res: express.Response, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(join(`https://${req.hostname}`, req.url));
    } else {
      next();
    }
  });
}

const port = Number(process.env.PORT) || 8081;
app.use((req, res, next) => {
  if (!process.env.URL) {
    process.env.URL =
      req.hostname === 'localhost'
        ? `${req.protocol}://${req.hostname}:${port}`
        : `${req.protocol}://${req.hostname}`;
  }
  next();
});

const apollo = new ApolloServer({
  context: ({ req, res }) => {
    if (!production) {
      const { operationName, variables, query } = req.body;
      logger.debug('Incoming Request');
      logger.debug(
        JSON.stringify(
          {
            operationName,
            variables,
          },
          null,
          2,
        ),
      );
      logger.debug(query);
    }
    return getContext({ req, res });
  },
  schema: getSchema(),
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
    logger.info(`Listening on port ${port}`);
  });

  const close = async () => {
    await new Promise(resolve => {
      logger.info('Closing server');
      server.close(resolve);
    });
    logger.info('Closing db');
    await db.close();
  };
  process.once('exit', close);
  process.once('SIGUSR2', async () => {
    await close();
    process.kill(process.pid, 'SIGUSR2');
  });
})().catch(e => logger.error('main error', e));
