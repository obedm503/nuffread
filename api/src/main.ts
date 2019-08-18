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
import { Listing } from './listing/listing.entity';
import { getContext, getSchema } from './schema';
import { School } from './school/school.entity';
import { User } from './user/user.entity';
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
      const { operationName, variables } = req.body;
      console.info('\nIncoming Request');
      console.info(
        JSON.stringify(
          {
            operationName,
            variables,
          },
          null,
          2,
        ),
      );
    }
    return getContext({ req, res });
  },
  schema: getSchema(),
  debug: !production,
});

apollo.applyMiddleware({
  app,
  path: '/',
  cors: {
    credentials: true,
    origin: process.env.ORIGIN || 'https://www.nuffread.com',
  },
});

(async () => {
  await db.connect([User, School, Admin, Listing, Book]);

  const server = app.listen(port, () => {
    console.info(`Listening on port ${port}`);
  });

  const close = async () => {
    await new Promise(resolve => {
      console.info('Closing server');
      server.close(resolve);
    });
    console.info('Closing db');
    await db.close();
  };
  process.once('exit', close);
  process.once('SIGUSR2', async () => {
    await close();
    process.kill(process.pid, 'SIGUSR2');
  });
})().catch(e => console.error('main error', e));
