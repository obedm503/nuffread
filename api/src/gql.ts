const isProduction = process.env.NODE_ENV === 'production';

import { ApolloError, ApolloServer } from 'apollo-server-express';
import { getContext, getSchema } from './schema';
import { logger } from './util';
import { complexityPlugin } from './util/complexity';
import { BadRequest, InternalError } from './util/error';
import { Session } from './util/types';

const schema = getSchema();

export function getApollo():ApolloServer {
  return new ApolloServer({
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
}
