import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
  NormalizedCacheObject,
} from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { Kind } from 'graphql';
import 'isomorphic-unfetch';
import { NextPageContext } from 'next';

const uri =
  process.env.NODE_ENV === 'production' ? '/graphql' : process.env.API;

export default function createApolloClient(
  initialState: NormalizedCacheObject,
  ctx: NextPageContext,
): ApolloClient<NormalizedCacheObject> {
  const ssrMode = Boolean(ctx);
  let headers;
  if (ssrMode) {
    const h = ctx.req.headers;
    headers = { cookie: h.cookie, 'user-agent': h['user-agent'] };
  }
  // The `ctx` (NextPageContext) will only be present on the server.
  // use it to extract auth headers (ctx.req) or similar.
  return new ApolloClient({
    ssrMode,
    link: new HttpLink({
      uri,
      credentials: 'include',
      headers,
    }),
    cache: new InMemoryCache({
      freezeResults: process.env.NODE_ENV !== 'production',
      fragmentMatcher: new IntrospectionFragmentMatcher({
        introspectionQueryResultData: {
          __schema: {
            types: [
              {
                kind: Kind.UNION_TYPE_DEFINITION,
                name: 'SystemUser',
                possibleTypes: [{ name: 'Admin' }, { name: 'User' }],
              },
            ],
          },
        },
      }),
    }).restore(initialState),
  });
}
