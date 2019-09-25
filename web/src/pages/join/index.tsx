import { IonButtons, IonContent, IonLabel } from '@ionic/react';
import * as React from 'react';
import { RouteComponentProps, RouteProps } from 'react-router';
import { IonButtonLink, Routes, TopNav } from '../../components';
import { Confirm } from './confirm';
import { Register } from './register';

const routes: RouteProps[] = [
  { path: '/:binId?', component: Confirm },
  { path: '/', component: Register },
];

export default ({ match }: RouteComponentProps<{}>) => (
  <>
    <TopNav>
      <IonButtons slot="end">
        <IonButtonLink activeColor="dark" href="/join">
          <IonLabel>Join</IonLabel>
        </IonButtonLink>
      </IonButtons>
    </TopNav>

    <IonContent>
      <Routes base={match.url} routes={routes} />
    </IonContent>
  </>
);
