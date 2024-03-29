import { gql } from '@apollo/client';
import { IonApp, IonSpinner } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
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
    return Public;
  }
  return Private;
});

export const App = () => {
  const res = useQuery(ME);

  const me = res.data?.me || undefined;
  React.useEffect(() => {
    if (me) {
      tracker.identify({ email: me.email });

      if (me.__typename === 'User') {
        tracker.enable(me.isTrackable);
      }
    }
  }, [me]);

  if (res.loading) {
    return (
      <div className="loading-page">
        <div className="spinner-wrapper">
          <IonSpinner />
        </div>
      </div>
    );
  }
  if (res.error) {
    return <Error value={res.error} />;
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
