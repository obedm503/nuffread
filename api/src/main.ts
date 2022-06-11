const isProduction = process.env.NODE_ENV === 'production';
const { join, resolve } = require('path');
require('dotenv-safe').config({
  path: isProduction ? undefined : resolve(__dirname, '../.env'),
  example: resolve(__dirname, '../.env.example'),
});
require('reflect-metadata');

import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from 'apollo-server-core';
import { ApolloError, ApolloServer } from 'apollo-server-express';
import pgSession from 'connect-pg-simple';
import express from 'express';
import session from 'express-session';
import { useServer } from 'graphql-ws/lib/use/ws';
import { createServer } from 'http';
import ms from 'ms';
import { promisify } from 'util';
import { WebSocketServer } from 'ws';
import { CONFIG } from './config';
import * as db from './db';
import { getContext } from './graphql/context';
import { BadRequest, InternalError } from './graphql/error';
import { schema } from './graphql/schema';
import { Session } from './types';
import { logger } from './util';

const Store = pgSession(session);
const sessionParser = session({
  secret: process.env.SECRET!,
  resave: false,
  rolling: true,
  saveUninitialized: false,
  name: 'session',
  cookie: {
    maxAge: ms('1 week'),
    // domain: isProduction ? 'nuffread.com' : undefined,
  },
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

const httpServer = createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/',
});
const serverCleanup = useServer(
  {
    schema,
    onError(ctx, message, errors) {
      for (const err of errors) {
        logger.error(err, 'SUBSCRIPTION_ERROR');
      }
    },
    onConnect({ extra }) {
      const req = extra.request;
      sessionParser(req as any, {} as any, e => {
        if (e) {
          logger.error(e, 'error parsing cookies');
        }
      });
    },
    context({ extra }, message, args) {
      const req = extra.request;
      const session = req['session'];
      return getContext({ req, session });
    },
  },
  wsServer,
);

const port = Number(process.env.PORT) || 8081;

const apollo = new ApolloServer({
  csrfPrevention: true,
  context({ req, res }: any) {
    return getContext({
      session: req['session'] as Session | undefined,
      req,
      res,
    });
  },
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
  // plugins: [complexityPlugin(schema)],
  plugins: [
    isProduction
      ? ApolloServerPluginLandingPageDisabled()
      : ApolloServerPluginLandingPageGraphQLPlayground({
          subscriptionEndpoint: `ws://localhost:${port}/`,
          settings: {
            'request.credentials': 'include',
            'schema.polling.interval': 120_000,
          },
        }),

    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),

    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

(async () => {
  await apollo.start();
  apollo.applyMiddleware({
    app,
    path: '/',
    cors: {
      credentials: true,
      origin: isProduction ? CONFIG.origin : true,
    },
  });

  const con = await db.connect();

  // await con.undoLastMigration();
  // run pending migrations
  await con.runMigrations({ transaction: 'all' });
  // await con.synchronize();

  const server = httpServer.listen(port, () => {
    logger.info(
      `🚀 Query endpoint ready at http://localhost:${port}${apollo.graphqlPath}`,
    );
    logger.info(
      `🚀 Subscription endpoint ready at ws://localhost:${port}${apollo.graphqlPath}`,
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
