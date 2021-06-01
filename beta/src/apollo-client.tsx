import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  NormalizedCacheObject,
} from '@apollo/client';
import merge from 'deepmerge';
import isEqual from 'lodash/isEqual';
import {
  NextPageContext,
  NextPage,
  GetServerSideProps,
  GetServerSidePropsContext,
} from 'next';
import { useMemo } from 'react';
import { ParsedUrlQuery } from 'querystring';

const uri = process.env.NEXT_PUBLIC_API;

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__';
export const APOLLO_CLIENT_PROP_NAME = '__APOLLO_CLIENT__';

let apolloClient;

function createApolloClient(ctx?: NextPageContext | GetServerSidePropsContext) {
  const ssrMode = typeof window === 'undefined';
  let headers;
  if (ssrMode && ctx?.req) {
    const h = ctx.req.headers;
    headers = { cookie: h.cookie, 'user-agent': h['user-agent'] };
  }
  return new ApolloClient({
    ssrMode,
    uri,
    credentials: 'include',
    headers,
    cache: new InMemoryCache({
      possibleTypes: {
        SystemUser: ['Admin', 'User'],
      },
    }),
  });
}

export function initializeApollo(
  initialState = null,
  ctx?: NextPageContext | GetServerSidePropsContext,
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

export function addApolloState(client, pageProps) {
  if (pageProps?.props) {
    pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract();
  }

  return pageProps;
}

export function useApollo(pageProps: NextPageContext) {
  const state = pageProps[APOLLO_STATE_PROP_NAME];
  const client = useMemo(
    () =>
      pageProps[APOLLO_CLIENT_PROP_NAME] ?? initializeApollo(state, pageProps),
    [state, pageProps],
  );
  return client;
}

export function withGraphQL<P, IP>(
  Page: NextPage<P, IP>,
): NextPage<
  P & {
    [APOLLO_CLIENT_PROP_NAME]?: ApolloClient<NormalizedCacheObject>;
    [APOLLO_STATE_PROP_NAME]?: NormalizedCacheObject;
  },
  IP
> {
  return props => {
    const client =
      props[APOLLO_CLIENT_PROP_NAME] ??
      initializeApollo(props[APOLLO_STATE_PROP_NAME], props as any);

    return (
      <ApolloProvider client={client}>
        <Page {...props} />
      </ApolloProvider>
    );
  };
}

export function makeGetSSP<P, Q extends ParsedUrlQuery>(
  Page: NextPage<P>,
  getServerSideProps?: GetServerSideProps<P, Q>,
): GetServerSideProps<P, Q> {
  return async ctx => {
    const { getDataFromTree } = await import('@apollo/client/react/ssr');
    // technically using an internal api
    // https://github.com/vercel/next.js/discussions/11957#discussioncomment-126931
    const { RouterContext } = await import(
      'next/dist/next-server/lib/router-context'
    );

    const apolloClient = initializeApollo(null, ctx);

    let resProps: P = {} as any;
    if (getServerSideProps) {
      const res = await getServerSideProps(ctx);
      if ('props' in res) {
        resProps = res.props;
      }
    }

    const router = {
      query: ctx.params,
      locales: ctx.locales,
      locale: ctx.locale,
      defaultLocale: ctx.defaultLocale,
      // missing route, pathname, asPath, basePath, isLocaleDomain
    } as any;

    const WrappedPage = withGraphQL(Page);
    const props = { ...resProps, [APOLLO_CLIENT_PROP_NAME]: apolloClient };
    await getDataFromTree(
      <RouterContext.Provider value={router}>
        <WrappedPage {...props} />
      </RouterContext.Provider>,
    );

    return {
      props: {
        ...resProps,
        [APOLLO_STATE_PROP_NAME]: apolloClient.extract(),
      },
    };
  };
}
