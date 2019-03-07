const production = process.env.NODE_ENV === 'production';
const { config } = require('dotenv-safe');
const { join, resolve } = require('path');

if (!production) {
  config({
    path: resolve(__dirname, '../.env'),
    example: resolve(__dirname, '../.env.example'),
  });
}
require('isomorphic-fetch');
require('reflect-metadata');
import { NestFactory } from '@nestjs/core';
import { ApolloServer } from 'apollo-server-express';
import * as pgSession from 'connect-pg-simple';
import * as express from 'express';
import * as session from 'express-session';
import { Admin } from './admin/admin.entity';
import { ApplicationModule } from './app.module';
import { Listing } from './listing/listing.entity';
import { getContext, getSchema } from './schema';
import { School } from './school/school.entity';
import { Seller } from './seller/seller.entity';
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
        conString: process.env.DATABASE_URL,
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
        ? `${req.protocol}://${req.hostname}`
        : `${req.protocol}://${req.hostname}:${port}`;
  }
  next();
});

if (!production) {
  app.use((req, res, next) => {
    console.info('\n\nRequest for ', req.url);
    next();
  });
}

const apollo = new ApolloServer({
  context: ({ req, res }) => getContext({ req, res }),
  schema: getSchema(),
});

apollo.applyMiddleware({
  app,
  cors: { credentials: true, origin: process.env.ORIGIN },
});

(async () => {
  await db.connect([Seller, School, Admin, Listing]);

  const server = await NestFactory.create(ApplicationModule, app, {});
  await server.listen(port);

  const close = async () => {
    console.info('Closing server');
    await server.close();
    console.info('Closing db');
    await db.close();
  };
  process.once('exit', close);
  process.once('SIGUSR2', async () => {
    await close();
    process.kill(process.pid, 'SIGUSR2');
  });

  console.info(`Listening on port ${port}`);
})().catch(e => console.error('main error', e));
