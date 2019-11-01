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
import { Error, Routes } from './components';
import Join from './pages/join';
import Landing from './pages/landing';
import { AdminLogin, UserLogin } from './pages/login';
import Private from './pages/private';
import ResetPassword from './pages/reset-password';
import { ISystemUser } from './schema.gql';
import { useQuery } from './state/apollo';
import { IsDesktopProvider } from './state/desktop';
import { tracker } from './state/tracker';
import { UserProvider } from './state/user';

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
        schoolName
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
  const loading = Fallback ? Fallback() : null;
  const Comp = React.lazy(factory);
  return props => (
    <React.Suspense fallback={loading}>
      <Comp {...props}></Comp>
    </React.Suspense>
  );
};

const Admin = makeLazy(() => import('./pages/admin'));
const Public = makeLazy(() => import('./pages/public'));

const isReady = process.env.REACT_APP_MODE === 'ready';
const homePage = (user?: ISystemUser) => {
  if (!user) {
    return isReady ? Public : Landing;
  }
  if (user.__typename === 'Admin') {
    return Admin;
  }
  return Private;
};

const makeRoutes = memoize((user?: ISystemUser): RouteProps[] => {
  const routes: RouteProps[] = [];

  if (user) {
    tracker.login({ email: user.email });
  } else {
    routes.push(
      { path: '/login', exact: true, component: UserLogin },
      { path: '/admin', exact: true, component: AdminLogin },
      { path: '/join', component: Join },
      { path: '/reset', component: ResetPassword },
    );
  }

  routes.push({ path: '/', component: homePage(user) });
  return routes;
});

export const App = () => {
  const { loading, data, error } = useQuery(ME);

  if (loading) {
    const Home = homePage();
    return <Home></Home>;
  }
  if (error) {
    return <Error value={error} />;
  }

  const me = (data && data.me) || undefined;
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
