const { production } = require('./util/env');
import { NestFactory } from '@nestjs/core';
import { ApolloServer } from 'apollo-server-express';
import * as pgSession from 'connect-pg-simple';
import * as express from 'express';
import * as session from 'express-session';
import { join, resolve } from 'path';
import { ServeStaticOptions } from 'serve-static';
import { Admin } from './admin/admin.entity';
import { ApplicationModule } from './app.module';
import { Listing } from './listing/listing.entity';
import { getContext, getSchema } from './schema';
import { School } from './school/school.entity';
import { Seller } from './seller/seller.entity';
import * as db from './util/db';

const Store = pgSession(session);

const distPublicDir = resolve(__dirname, '../../dist/public');
const publicDir = resolve(__dirname, '../../public');

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

const staticOptions: ServeStaticOptions = { etag: false, index: false };
app.use(
  '/',
  express.static(distPublicDir, staticOptions),
  express.static(publicDir, staticOptions),
);

app.use((req, res, next) => {
  if (!process.env.URL) {
    process.env.URL = `${req.protocol}://${req.hostname}:${process.env.PORT}`;
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

apollo.applyMiddleware({ app });

(async () => {
  await db.connect([Seller, School, Admin, Listing]);

  const server = await NestFactory.create(ApplicationModule, app, {});
  const port = Number(process.env.PORT) || 8080;
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
