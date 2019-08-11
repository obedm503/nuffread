import { IonButtons, IonContent, IonLabel } from '@ionic/react';
import * as React from 'react';
import { RouteComponentProps, RouteProps } from 'react-router';
import { IonButtonLink, Routes, TopNav } from '../../components';
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

export const Join: React.SFC<RouteComponentProps<{}>> = ({ match }) => (
  <>
    <TopNav>
      <IonButtons slot="start">
        <IonButtonLink activeColor="dark" href="/join">
          <IonLabel>Join</IonLabel>
        </IonButtonLink>
      </IonButtons>

      <IonButtons slot="end">
        <IonButtonLink activeColor="dark" href="/join/pricing">
          <IonLabel>Pricing</IonLabel>
        </IonButtonLink>
        <IonButtonLink activeColor="dark" href="/join/signup">
          <IonLabel>Signup</IonLabel>
        </IonButtonLink>
      </IonButtons>
    </TopNav>

    <IonContent>
      <Routes base={match.url} routes={routes} />
    </IonContent>
  </>
);
