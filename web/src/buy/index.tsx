import {
  IonButton,
  IonButtons,
  IonContent,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import * as React from 'react';
import { RouteComponentProps, RouteProps } from 'react-router';
import { Routes } from '../components';
import { Details } from './details';
import { Home } from './home';

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
      <IonToolbar>
        <IonTitle>nuffread</IonTitle>
        <IonButtons slot="secondary">
          <IonButton href="/join">
            <b>Join</b>
          </IonButton>
          <IonButton href="/login">Login</IonButton>
        </IonButtons>
      </IonToolbar>

      <IonContent>
        <Routes base={match.url} routes={routes} />
      </IonContent>
    </>
  );
};
