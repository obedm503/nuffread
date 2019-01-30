const { production } = require('./util/env');
import { NestFactory } from '@nestjs/core';
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express';
// import * as client from '@sendgrid/client';
// import * as mail from '@sendgrid/mail';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { join, resolve } from 'path';
import { ServeStaticOptions } from 'serve-static';
import { ApplicationModule } from './app.module';
import { getApolloConfig } from './schema';

const distPublicDir = resolve(__dirname, '../../dist/public');
const publicDir = resolve(__dirname, '../../public');

const server = express()
  .disable('etag')
  .disable('x-powered-by')
  .set('trust proxy', true)
  .use(cookieParser())
  .use(bodyParser.json());

if (production) {
  // force ssl
  server.use((req: express.Request, res: express.Response, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(join(`https://${req.hostname}`, req.url));
    } else {
      next();
    }
  });
}

const staticOptions: ServeStaticOptions = { etag: false, index: false };
server.use(
  '/public',
  express.static(distPublicDir, staticOptions),
  express.static(publicDir, staticOptions),
  (req, res) => {
    res.statusCode = 404;
    res.end();
  },
);

// graphql
server.use('/graphql', graphqlExpress(req => getApolloConfig(req!)));

if (!production) {
  // graphiql
  server.get('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));
}

const port = Number(process.env.PORT) || 3000;

(async () => {
  // client.setApiKey(process.env.SENDGRID_API_KEY!);
  // mail.setApiKey(process.env.SENDGRID_API_KEY!);

  const app = await NestFactory.create(ApplicationModule, server, {});
  // const httpRef = app.get(HTTP_SERVER_REF);
  // app.useGlobalFilters(new NoAuthExceptionFilter(httpRef));
  await app.listen(port);

  process.once('SIGUSR2', function() {
    app.close();
    console.info(`Closed on port ${port}`);
    process.kill(process.pid, 'SIGUSR2');
  });

  console.info(`Listening on port ${port}`);
})().catch(e => console.error('main error', e));
