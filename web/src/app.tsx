import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from 'apollo-cache-inmemory';
import { Kind } from 'graphql';
import gql from 'graphql-tag';
import { memoize } from 'lodash';
import * as React from 'react';
import { Query } from 'react-apollo';
import { Helmet } from 'react-helmet-async';
import { Redirect, RouteProps } from 'react-router';
import './app.scss';
import { Error, Routes } from './components';
import { Join } from './pages/join';
import { Landing } from './pages/landing';
import { AdminLogin, UserLogin } from './pages/login';
import Private from './pages/private';
import Public from './pages/public';
import { IQuery, SystemUser } from './schema.gql';
import { IsDesktopProvider, UserProvider } from './state';

export const createCache = () =>
  new InMemoryCache({
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
  });

const ME = gql`
  query GetMe {
    me {
      ... on User {
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

function ToHome() {
  return <Redirect to="/" />;
}

export class App extends React.PureComponent {
  makeRoutes = memoize(
    (user?: SystemUser): RouteProps[] => {
      if (process.env.REACT_APP_MODE !== 'ready') {
        return [{ component: Landing }];
      }

      let routes: RouteProps[] = [
        { path: '/join', component: user ? ToHome : Join },
        { path: '/login', exact: true, component: user ? ToHome : UserLogin },
        { path: '/admin', exact: true, component: user ? ToHome : AdminLogin },
      ];

      if (!user) {
        routes.push({ path: '/', component: Public });
      } else if (user.__typename === 'User') {
        routes.push({ path: '/', component: Private });
      } else if (user.__typename === 'Admin') {
        routes.push({ path: '/', component: () => <div>Admin page</div> });
      }
      return routes;
    },
  );

  render() {
    return (
      <Query<IQuery> query={ME}>
        {({ loading, data, error }) => {
          if (loading || !data) {
            return null;
          }
          if (error) {
            return <Error value={error} />;
          }

          const me = data.me || undefined;
          const routes = this.makeRoutes(me);
          return (
            <IsDesktopProvider>
              <UserProvider value={{ me }}>
                <Helmet>
                  <title>nuffread</title>
                  <meta
                    name="description"
                    content="The book marketplace for students"
                  />
                </Helmet>

                <Routes routes={routes} />
              </UserProvider>
            </IsDesktopProvider>
          );
        }}
      </Query>
    );
  }
}
