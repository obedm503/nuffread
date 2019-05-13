import '@ionic/core/css/core.css';
import '@ionic/core/css/ionic.bundle.css';
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
import {
  Redirect,
  RouteComponentProps,
  RouteProps,
  withRouter,
} from 'react-router';
import { Buy } from './buy';
import { Error, Footer, Routes } from './components';
import { Join } from './join';
import { Launch } from './launch';
import { Admin, Login } from './login';
import './main.scss';
import { IQuery, User } from './schema.gql';
import { Sell } from './sell';
import { IsDesktopProvider } from './state/desktop';
import { UserProvider } from './state/user';
import './theme.css';

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

function ToHome() {
  return <Redirect to="/" />;
}

class App extends React.Component<RouteComponentProps<{}>> {
  makeRoutes = memoize(
    (user?: User): RouteProps[] => {
      if (process.env.REACT_APP_MODE !== 'ready') {
        return [{ component: Launch }];
      }

      let routes: RouteProps[] = [
        { path: '/join', component: user ? ToHome : Join },
        { path: '/login', exact: true, component: user ? ToHome : Login },
        { path: '/admin', exact: true, component: user ? ToHome : Admin },
      ];

      if (!user) {
        routes.push({ path: '/', component: Buy });
      } else if (user.__typename === 'Seller') {
        routes.push({ path: '/', component: Sell });
      } else if (user.__typename === 'Admin') {
        routes.push({ path: '/', component: () => <div>Admin page</div> });
      }
      return routes;
    },
  );
  render() {
    const { match } = this.props;
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
              <UserProvider value={{ user: me }}>
                <Helmet>
                  <title>nuffread</title>
                  <meta
                    name="description"
                    content="The book marketplace for students"
                  />
                </Helmet>
                <Routes routes={routes} key={match.url} />

                <Footer />
              </UserProvider>
            </IsDesktopProvider>
          );
        }}
      </Query>
    );
  }
}
const AppWithRouter = withRouter(App);
export { AppWithRouter as App };
