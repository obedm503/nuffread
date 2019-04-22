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
import { Confirm } from './confirm';
import { Home } from './home';
import { Pricing } from './pricing';
import { Register } from './register';

const routes: RouteProps[] = [
  { path: '/pricing', component: Pricing },
  { path: '/signup', component: Register },
  { path: '/confirm/:binId?', component: Confirm },
  { path: '/', component: Home },
];

export const Join: React.SFC<RouteComponentProps<{}>> = ({
  match,
  location,
}) => (
  <>
    <IonToolbar>
      <IonTitle>nuffread</IonTitle>

      <IonButtons slot="end">
        <IonButton href="/">Search</IonButton>
        <IonButton href="/join/pricing">Pricing</IonButton>
        {location.pathname.endsWith('/join/signup') ? null : (
          <IonButton href="/join/signup">Signup</IonButton>
        )}
      </IonButtons>
    </IonToolbar>

    <IonContent>
      <Routes base={match.url} routes={routes} />
    </IonContent>
  </>
);
