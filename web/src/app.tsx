import { useQuery } from '@apollo/react-hooks';
import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from 'apollo-cache-inmemory';
import { Kind } from 'graphql';
import gql from 'graphql-tag';
import memoize from 'lodash/memoize';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { RouteProps } from 'react-router';
import './app.scss';
import { Error, Loading, Routes } from './components';
import Landing from './pages/landing';
import { AdminLogin, UserLogin } from './pages/login';
import { IQuery, SystemUser } from './schema.gql';
import { IsDesktopProvider, UserProvider } from './state';

export const createCache = () =>
  new InMemoryCache({
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

const Join = makeLazy(() => import('./pages/join'));
const Public = makeLazy(() => import('./pages/public'));
const Private = makeLazy(() => import('./pages/private'));
const Admin = makeLazy(() => import('./pages/admin'));

const isReady = process.env.REACT_APP_MODE === 'ready';
const homePage = (user?: SystemUser) => {
  if (!user) {
    return isReady ? Public : Landing;
  }
  if (user.__typename === 'Admin') {
    return Admin;
  }
  return Private;
};

const makeRoutes = memoize((user?: SystemUser): RouteProps[] => {
  const routes: RouteProps[] = [];

  if (!user) {
    routes.push(
      { path: '/login', exact: true, component: UserLogin },
      { path: '/admin', exact: true, component: AdminLogin },
      { path: '/join', component: Join },
    );
  }

  routes.push({ path: '/', component: homePage(user) });
  return routes;
});

export const App = () => {
  const { loading, data, error } = useQuery<IQuery>(ME);

  if (loading) {
    const Home = homePage();
    return <Home></Home>;
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
