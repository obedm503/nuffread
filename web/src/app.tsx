import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from 'apollo-cache-inmemory';
import { Kind } from 'graphql';
import gql from 'graphql-tag';
import { memoize } from 'lodash';
import * as React from 'react';
import { useQuery } from 'react-apollo';
import { Helmet } from 'react-helmet-async';
import { Redirect, RouteProps } from 'react-router';
import './app.scss';
import { Error, Loading, Routes } from './components';
import { AdminLogin, UserLogin } from './pages/login';
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

const makeLazy = <T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  Fallback?: () => NonNullable<React.ReactNode>,
) => {
  const loading = Fallback ? Fallback() : <Loading />;
  const Comp = React.lazy(factory);
  return props => (
    <React.Suspense fallback={loading}>
      <Comp {...props}></Comp>
    </React.Suspense>
  );
};
const Landing = makeLazy(() => import('./pages/landing'));
const Join = makeLazy(() => import('./pages/join'));
const Public = makeLazy(() => import('./pages/public'));
const Private = makeLazy(() => import('./pages/private'));

const userHome = (user: SystemUser) => {
  if (user.__typename === 'Admin') {
    return () => <div>Admin page</div>;
  }
  return Private;
};

const makeRoutes = memoize((user?: SystemUser): RouteProps[] => {
  const isReady = process.env.REACT_APP_MODE === 'ready';
  let routes: RouteProps[] = [
    { path: '/login', exact: true, component: user ? ToHome : UserLogin },
  ];

  if (user) {
    routes.push({ path: '/', component: userHome(user) });
  } else if (isReady) {
    routes.push({ path: '/', component: Public });
  } else {
    routes.push({ component: Landing });
  }

  if (isReady) {
    routes.push({ path: '/join', component: user ? ToHome : Join });
  }

  routes.push({
    path: '/admin',
    exact: true,
    component: user ? ToHome : AdminLogin,
  });

  return routes;
});

export const App = () => {
  const { loading, data, error } = useQuery<IQuery>(ME);

  if (loading) {
    return null;
  }
  if (error) {
    return <Error value={error} />;
  }

  const me = data && data.me;
  const routes = makeRoutes(me);
  return (
    <IsDesktopProvider>
      <UserProvider value={me}>
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
};
