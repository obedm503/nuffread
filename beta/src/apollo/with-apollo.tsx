import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';
import merge from 'deepmerge';
import isEqual from 'lodash/isEqual';
import { GetServerSidePropsContext, NextPage, NextPageContext } from 'next';
import { useMemo } from 'react';

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__';
export const APOLLO_CLIENT_PROP_NAME = '__APOLLO_CLIENT__';

type Client = ApolloClient<NormalizedCacheObject>;
let apolloClient: Client;

function createApolloClient(ctx: NextPageContext | GetServerSidePropsContext) {
  const ssrMode = typeof window === 'undefined';
  let headers = {};
  if (ssrMode && ctx.req) {
    const h = ctx.req.headers;
    headers = { cookie: h.cookie, 'user-agent': h['user-agent'] };
  }
  return new ApolloClient({
    ssrMode,
    uri: process.env.NEXT_PUBLIC_GRAPHQL_API,
    credentials: 'include',
    headers,
    cache: new InMemoryCache({
      possibleTypes: {
        SystemUser: ['Admin', 'User'],
      },
    }),
  });
}

export function initializeApolloClient(
  ctx: NextPageContext | GetServerSidePropsContext,
  initialState?: NormalizedCacheObject,
): ApolloClient<NormalizedCacheObject> {
  const _apolloClient = apolloClient ?? createApolloClient(ctx);

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();

    // Merge the existing cache into data passed from getStaticProps/getServerSideProps
    const data = merge(initialState, existingCache, {
      // combine arrays using object equality (like in sets)
      arrayMerge: (destinationArray, sourceArray) => [
        ...sourceArray,
        ...destinationArray.filter(d => sourceArray.every(s => !isEqual(d, s))),
      ],
    });

    // Restore the cache with the merged data
    _apolloClient.cache.restore(data);
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

// export function addApolloState(client: Client, pageProps: any) {
//   if (pageProps?.props) {
//     pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract();
//   }

//   return pageProps;
// }

type Props<P> = P & {
  [APOLLO_CLIENT_PROP_NAME]?: ApolloClient<NormalizedCacheObject>;
  [APOLLO_STATE_PROP_NAME]?: NormalizedCacheObject;
};
export function useApolloClient(pageProps: Props<NextPageContext>) {
  const state = (pageProps as any)[APOLLO_STATE_PROP_NAME];
  const client = useMemo(
    () =>
      (pageProps as any)[APOLLO_CLIENT_PROP_NAME] ??
      initializeApolloClient(pageProps, state),
    [state, pageProps],
  );
  return client;
}

export function withApollo<P, IP>(
  Page: NextPage<P, IP>,
): NextPage<Props<P>, IP> {
  return function WithApollo(props) {
    const client =
      props[APOLLO_CLIENT_PROP_NAME] ??
      initializeApolloClient(props as any, props[APOLLO_STATE_PROP_NAME]);

    return (
      <ApolloProvider client={client}>
        <Page {...props} />
      </ApolloProvider>
    );
  };
}
