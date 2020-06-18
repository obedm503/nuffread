const isProduction = process.env.NODE_ENV === 'production';
const { join, resolve } = require('path');
require('dotenv-safe').config({
  path: isProduction ? undefined : resolve(__dirname, '../.env'),
  example: resolve(__dirname, '../.env.example'),
});
require('reflect-metadata');

import pgSession from 'connect-pg-simple';
import express from 'express';
import session from 'express-session';
import { createServer } from 'http';
import ms from 'ms';
import { promisify } from 'util';
import { CONFIG } from './config';
import { getApollo } from './gql';
import { logger } from './util';
import * as db from './util/db';

const Store = pgSession(session);
const sessionParser = session({
  secret: process.env.SECRET!,
  resave: false,
  rolling: true,
  saveUninitialized: false,
  name: 'session',
  cookie: { maxAge: ms('1 week') },
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

const apollo = getApollo();
const httpServer = createServer(app);

apollo.applyMiddleware({
  app,
  path: '/',
  cors: {
    credentials: true,
    origin: isProduction ? CONFIG.origin : true,
  },
});
apollo.installSubscriptionHandlers(httpServer);
// parse websocket cookies
httpServer.on('upgrade', (req, socket) => {
  logger.info('new socket connection');
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
