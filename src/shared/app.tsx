import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from 'apollo-cache-inmemory';
import { Kind } from 'graphql';
import gql from 'graphql-tag';
import * as React from 'react';
import { Query } from 'react-apollo';
import { RouteProps, withRouter } from 'react-router';
import { Buy } from './buy';
import { Error, Footer, Routes } from './components';
import { Join } from './join';
import { Launch } from './launch';
import { Sell } from './sell';
import { IsDesktopProvider } from './state/desktop';
import { UserProvider } from './state/user';

export const createCache = () =>
  new InMemoryCache({
    fragmentMatcher: new IntrospectionFragmentMatcher({
      introspectionQueryResultData: {
        __schema: {
          types: [
            {
              kind: Kind.UNION_TYPE_DEFINITION,
              name: 'User',
              possibleTypes: [{ name: 'Admin' }, { name: 'Seller' }],
            },
          ],
        },
      },
    }),
  });

const makeRoutes = (user?: GQL.User): RouteProps[] => {
  if (process.env.MODE !== 'ready') {
    return [{ component: Launch }];
  }

  let routes: RouteProps[] = [
    { path: '/login', exact: true, component: () => <div>Login page</div> },
    { path: '/join', exact: true, component: Join },
  ];

  if (!user) {
    routes.push({ path: '/', component: Buy });
  } else if (user.__typename === 'Seller') {
    routes.push({ path: '/', component: Sell });
  } else if (user.__typename === 'Admin') {
    routes.push({ path: '/', component: () => <div>Admin page</div> });
  }
  return routes;
};

const ME = gql`
  query GetMe {
    me {
      ... on Seller {
        id
        email
        name
        photo
      }
      ... on Admin {
        id
        email
      }
    }
  }
`;

export const App = withRouter(({ match }) => {
  return (
    <Query<GQL.IQuery> query={ME}>
      {({ loading, data, error }) => {
        if (loading || !data) {
          return null;
        }
        if (error) {
          return <Error value={error} />;
        }

        const me = data.me || undefined;
        const routes = makeRoutes(me);
        return (
          <IsDesktopProvider>
            <UserProvider value={{ user: me }}>
              <Routes routes={routes} key={match.url} />

              <Footer />
            </UserProvider>
          </IsDesktopProvider>
        );
      }}
    </Query>
  );
});
