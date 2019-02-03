import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from 'apollo-cache-inmemory';
import { Kind } from 'graphql';
import * as React from 'react';
import { RouteProps, withRouter } from 'react-router';
import { Buy } from './buy';
import { Footer, Routes } from './components';
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

const routes: RouteProps[] =
  process.env.MODE === 'launch'
    ? [{ component: Launch }]
    : [
        { path: '/sell', component: Sell },
        { path: '/', component: Buy },
        { component: () => <p>Page not Found</p> },
      ];

export const App = withRouter(({ match }) => (
  <IsDesktopProvider>
    <UserProvider value={{ user: {} } as any}>
      <Routes routes={routes} key={match.url} />

      <Footer />
    </UserProvider>
  </IsDesktopProvider>
));
