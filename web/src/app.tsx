import { IonApp, IonSpinner } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import {
  InMemoryCache,
  IntrospectionFragmentMatcher
} from 'apollo-cache-inmemory';
import { Kind } from 'graphql';
import gql from 'graphql-tag';
import memoizeOne from 'memoize-one';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { RouteProps } from 'react-router';
import './app.scss';
import { Error, TrackApp } from './components';
import Join from './pages/join';
import { UserLogin } from './pages/login';
import ResetPassword from './pages/reset-password';
import Private from './roots/private';
import Public from './roots/public';
import { ISystemUser } from './schema.gql';
import { IsDesktopProvider, tracker, useQuery, UserProvider } from './state';
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
        isTrackable
        school {
          id
          name
        }
      }
    }
  }
`;

const globalRoutes: readonly RouteProps[] = [
  { path: '/login', exact: true, component: UserLogin },
  { path: '/join', component: Join },
  { path: '/reset', component: ResetPassword },
];

const rootPage = memoizeOne(function (
  user?: ISystemUser,
): React.ComponentType<RootPageProps> {
  if (!user) {
    return Public 
  }
  return Private;
});

export const App = () => {
  const { data, error, loading } = useQuery(ME);

  const me = data?.me || undefined;
  React.useEffect(() => {
    if (me) {
      tracker.identify({ email: me.email });

      if (me.__typename === 'User') {
        tracker.enable(me.isTrackable);
      }
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
