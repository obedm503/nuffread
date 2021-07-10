// NOTICE: this file only runs on the server side

import { getDataFromTree } from '@apollo/client/react/ssr';
import { GetServerSideProps, NextPage } from 'next';
// NOTICE: technically using an internal api
// https://github.com/vercel/next.js/discussions/11957#discussioncomment-126931
import { RouterContext } from 'next/dist/next-server/lib/router-context';
import { ParsedUrlQuery } from 'querystring';
import {
  APOLLO_CLIENT_PROP_NAME,
  APOLLO_STATE_PROP_NAME,
  initializeApolloClient,
  withApollo,
} from './with-apollo';

export function makeApolloSSR<P, Q extends ParsedUrlQuery>(
  Page: NextPage<P>,
  getServerSideProps?: GetServerSideProps<P, Q>,
): GetServerSideProps<P, Q> {
  return async ctx => {
    const apolloClient = initializeApolloClient(ctx);

    let ssProps: P = {} as any;
    if (getServerSideProps) {
      const res = await getServerSideProps(ctx);
      if ('props' in res) {
        ssProps = res.props;
      }
    }

    const router = {
      query: ctx.params,
      locales: ctx.locales,
      locale: ctx.locale,
      defaultLocale: ctx.defaultLocale,
      // missing route, pathname, asPath, basePath, isLocaleDomain
    } as any;

    const WrappedPage = withApollo(Page);
    const props = {
      ...ssProps,
      [APOLLO_CLIENT_PROP_NAME]: apolloClient,
    };
    await getDataFromTree(
      <RouterContext.Provider value={router}>
        <WrappedPage {...props} />
      </RouterContext.Provider>,
    );

    return {
      props: {
        ...ssProps,
        [APOLLO_STATE_PROP_NAME]: apolloClient.extract(),
      },
    };
  };
}
