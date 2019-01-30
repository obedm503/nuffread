const { production } = require('./util/env');
import { NestFactory } from '@nestjs/core';
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { join, resolve } from 'path';
import { ServeStaticOptions } from 'serve-static';
import { ApplicationModule } from './app.module';
import { getApolloConfig } from './schema';
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

// graphql
app.use('/graphql', graphqlExpress(req => getApolloConfig(req!)));

if (!production) {
  // graphiql
  app.get('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));
}

const port = Number(process.env.PORT) || 3000;

(async () => {
  await db.connect();

  const server = await NestFactory.create(ApplicationModule, app, {});
  // const httpRef = nest.get(HTTP_SERVER_REF);
  // nest.useGlobalFilters(new NoAuthExceptionFilter(httpRef));
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
