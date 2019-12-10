import { IonApp, IonSpinner } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
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
import { Error } from './components';
import { TrackApp } from './components/track-app';
import Join from './pages/join';
import { AdminLogin, UserLogin } from './pages/login';
import ResetPassword from './pages/reset-password';
import Landing from './roots/landing';
import Private from './roots/private';
import { ISystemUser } from './schema.gql';
import { useQuery } from './state/apollo';
import { IsDesktopProvider } from './state/desktop';
import { tracker } from './state/tracker';
import { UserProvider } from './state/user';
import { RootPageProps } from './util.types';

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
        school {
          id
          name
        }
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
      <Comp {...props} />
    </React.Suspense>
  );
};

const Admin = makeLazy(() => import('./roots/admin'));
const Public = makeLazy(() => import('./roots/public'));

const globalRoutes: readonly RouteProps[] = [
  { path: '/login', exact: true, component: UserLogin },
  { path: '/admin', exact: true, component: AdminLogin },
  { path: '/join', component: Join },
  { path: '/reset', component: ResetPassword },
];

const isReady = process.env.REACT_APP_MODE === 'ready';
const rootPage = memoize(function(
  user?: ISystemUser,
): React.ComponentType<RootPageProps> {
  if (!user) {
    return isReady ? Public : Landing;
  }
  if (user.__typename === 'Admin') {
    return Admin;
  }
  return Private;
});

export const App = () => {
  const { data, error, loading } = useQuery(ME);

  const me = data?.me || undefined;
  React.useEffect(() => {
    if (me) {
      tracker.login({ email: me.email });
    }
  }, [me]);

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner-wrapper">
          <IonSpinner />
        </div>
      </div>
    );
  }
  if (error) {
    return <Error value={error} />;
  }

  const Root = rootPage(me);
  return (
    <IonApp>
      <IonReactRouter>
        <TrackApp>
          <IsDesktopProvider>
            <UserProvider value={me}>
              <Helmet>
                <title>nuffread</title>
                <meta
                  name="description"
                  content="The book marketplace for students"
                />
              </Helmet>

              <Root globalRoutes={globalRoutes} />
            </UserProvider>
          </IsDesktopProvider>
        </TrackApp>
      </IonReactRouter>
    </IonApp>
  );
};
