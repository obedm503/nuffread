import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  HttpLink,
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

type ReqRes = Pick<NextPageContext | GetServerSidePropsContext, 'req' | 'res'>;
type Req = ReqRes['req'];
type Res = ReqRes['res'];
function createApolloClient(req: Req, res: Res) {
  const ssrMode = typeof window === 'undefined';

  // incoming headers
  let headers = {};
  if (ssrMode && req) {
    const incomingHeaders = req.headers;
    headers = {
      cookie: incomingHeaders.cookie,
      'user-agent': incomingHeaders['user-agent'],
    };
  }

  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_API,
    credentials: 'include',
    headers,
  });

  // returning headers
  let link: any = httpLink;
  if (ssrMode && res) {
    link = new ApolloLink((op, forward) => {
      return forward(op).map(forwardRes => {
        const context = op.getContext();
        const returningHeaders = context.response.headers as Headers;
        const setCookie = returningHeaders.get('Set-Cookie');
        if (setCookie) {
          res.setHeader('Set-Cookie', setCookie);
        }
        return forwardRes;
      });
    }).concat(httpLink);
  }

  return new ApolloClient({
    ssrMode,
    cache: new InMemoryCache({
      possibleTypes: { SystemUser: ['Admin', 'User'] },
    }),
    link,
    connectToDevTools: process.env.NODE_ENV !== 'production',
  });
}

export function initializeApolloClient(
  { req, res }: ReqRes,
  initialState?: NormalizedCacheObject,
): ApolloClient<NormalizedCacheObject> {
  const _apolloClient = apolloClient ?? createApolloClient(req, res);

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
  const state = pageProps[APOLLO_STATE_PROP_NAME];
  const client = useMemo(
    () =>
      pageProps[APOLLO_CLIENT_PROP_NAME] ??
      initializeApolloClient(pageProps, state),
    [state, pageProps],
  );
  return client;
}

export function withApollo<P, IP>(
  Page: NextPage<P, IP>,
): NextPage<
  Props<
    P & {
      [APOLLO_CLIENT_PROP_NAME]?: ApolloClient<NormalizedCacheObject>;
      [APOLLO_STATE_PROP_NAME]?: NormalizedCacheObject;
    }
  >,
  IP
> {
  return function WithApollo(props) {
    const client =
      props[APOLLO_CLIENT_PROP_NAME] ??
      initializeApolloClient({}, props[APOLLO_STATE_PROP_NAME]);

    return (
      <ApolloProvider client={client}>
        <Page {...props} />
      </ApolloProvider>
    );
  };
}
