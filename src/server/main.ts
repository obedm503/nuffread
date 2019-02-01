const { production } = require('./util/env');
import { NestFactory } from '@nestjs/core';
import { ApolloServer } from 'apollo-server-express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { join, resolve } from 'path';
import { ServeStaticOptions } from 'serve-static';
import { Admin } from './admin/admin.entity';
import { ApplicationModule } from './app.module';
import { Listing } from './listing/listing.entity';
import { getContext, getSchema } from './schema';
import { School } from './school/school.entity';
import { Seller } from './seller/seller.entity';
import * as db from './util/db';

const distPublicDir = resolve(__dirname, '../../dist/public');
const publicDir = resolve(__dirname, '../../public');

const app = express()
  .disable('etag')
  .disable('x-powered-by')
  .set('trust proxy', true)
  .use(cookieParser())
  .use(bodyParser.json());

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
  '/public',
  express.static(distPublicDir, staticOptions),
  express.static(publicDir, staticOptions),
  (req, res) => {
    res.statusCode = 404;
    res.end();
  },
);

const apollo = new ApolloServer({
  context: ({ req }) => getContext(req),
  schema: getSchema(),
  introspection: true,
  playground: true,
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
