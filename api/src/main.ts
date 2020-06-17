const isProduction = process.env.NODE_ENV === 'production';
const { join, resolve } = require('path');
require('dotenv-safe').config({
  path: isProduction ? undefined : resolve(__dirname, '../.env'),
  example: resolve(__dirname, '../.env.example'),
});
require('reflect-metadata');

import { ApolloError, ApolloServer } from 'apollo-server-express';
import * as pgSession from 'connect-pg-simple';
import * as express from 'express';
import * as session from 'express-session';
import { createServer } from 'http';
import { promisify } from 'util';
import { CONFIG } from './config';
import { getContext, getSchema } from './schema';
import { logger } from './util';
import { complexityPlugin } from './util/complexity';
import * as db from './util/db';
import { BadRequest, InternalError } from './util/error';
import { Session } from './util/types';

const Store = pgSession(session);
const sessionParser = session({
  secret: process.env.SECRET!,
  resave: false,
  saveUninitialized: false,
  name: 'session',
  store: new Store({
    conObject: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
  }),
});
const app = express()
  .disable('etag')
  .disable('x-powered-by')
  .set('trust proxy', true)
  .use(sessionParser)
  .get('/_health', (req, res) => res.status(200).send('ok'));

if (isProduction) {
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

const schema = getSchema();
const apollo = new ApolloServer({
  tracing: !isProduction,
  subscriptions: {
    path: '/',
    onConnect: (params, ws, ctx) =>
      getContext({ session: ctx.request['session'] }),
  },
  context: ({ req, res, connection }) =>
    connection
      ? connection.context
      : getContext({ session: req.session as Session | undefined, req, res }),
  schema,
  formatError(e) {
    const { extensions, originalError } = e;
    logger.error(e, 'APOLLO_ERROR');

    if (!isProduction) {
      return e;
    }

    if (extensions?.code === 'BAD_USER_INPUT') {
      return new BadRequest();
    }

    if (originalError instanceof ApolloError) {
      return e;
    }

    return new InternalError();
  },
  plugins: [complexityPlugin(schema)],
  playground: isProduction
    ? false
    : {
        settings: {
          'request.credentials': 'include',
          'schema.polling.interval': 120_000,
        } as any,
      },
});

apollo.applyMiddleware({
  app,
  path: '/',
  cors: {
    credentials: true,
    origin: isProduction ? CONFIG.origin : true,
  },
});

const httpServer = createServer(app);
apollo.installSubscriptionHandlers(httpServer);
// parse websocket cookies
httpServer.on('upgrade', (req, socket) => {
  sessionParser(req as any, {} as any, e => {
    if (e) {
      logger.error(e, 'error parsing cookies');
    }
  });
});

(async () => {
  const con = await db.connect();

  // await con.undoLastMigration();
  // run pending migrations
  await con.runMigrations({ transaction: 'all' });
  // await con.synchronize();

  const server = httpServer.listen(port, () => {
    logger.info(
      `🚀 Server ready at http://localhost:${port}${apollo.graphqlPath}`,
    );
    logger.info(
      `🚀 Subscriptions ready at ws://localhost:${port}${apollo.subscriptionsPath}`,
    );
  });

  const close = async () => {
    await db.close();
    logger.info('closed server');
    await promisify(server.close).call(server);
  };
  process.once('exit', close);
  process.once('SIGUSR2', async () => {
    await close();
    process.kill(process.pid, 'SIGUSR2');
  });

  // based on https://blog.heroku.com/best-practices-nodejs-errors
  // function terminate(server: Server) {
  //   return (code: number, reason: string) => err => {
  //     // Exit function
  //     const exit = () => {
  //       logger.info(reason);
  //       process.env.CORE_DUMP ? process.abort() : process.exit(code);
  //     };

  //     if (err && err instanceof Error) {
  //       // Log error information, use a proper logging library here :)
  //       logger.fatal(err.message, err.stack);
  //     }

  //     // Attempt a graceful shutdown
  //     server.close(exit);
  //     setTimeout(exit, 1500).unref();
  //   };
  // }

  // const exitHandler = terminate(server);

  // process.on('uncaughtException', exitHandler(1, 'Unexpected Error'));
  // process.on('unhandledRejection', exitHandler(1, 'Unhandled Promise'));
  // process.on('SIGTERM', exitHandler(0, 'SIGTERM'));
  // process.on('SIGINT', exitHandler(0, 'SIGINT'));
})().catch(e => logger.fatal(e));
