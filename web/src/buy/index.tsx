import * as React from 'react';
import { RouteComponentProps, RouteProps } from 'react-router';
import { Routes, TopNav } from '../components';
import { Details } from './details';
import { Home } from './home';
import { IonItem, IonLabel, IonContent } from '@ionic/react';

const routes: RouteProps[] = [
  {
    path: '/:listingId/details',
    component: Details,
    exact: true,
  },
  { path: '/:listingId?', component: Home },
];

export const Buy: React.SFC<RouteComponentProps<{}>> = ({ match }) => {
  return (
    <>
      <TopNav>
        {({ isActive, onClick }) => (
          <>
            <IonItem>
              <IonLabel>nuffread</IonLabel>
            </IonItem>
            {/* <NavbarMenu isActive={isActive}>
              <NavbarEnd> */}
            <IonItem href="/join">
              <IonLabel>
                <b>Join</b>
              </IonLabel>
            </IonItem>
            <IonItem href="/login">
              <IonLabel>Login</IonLabel>
            </IonItem>
            {/* </NavbarEnd>
            </NavbarMenu> */}
          </>
        )}
      </TopNav>

      <main>
        <IonContent>
          <Routes base={match.url} routes={routes} />
        </IonContent>
      </main>
    </>
  );
};
