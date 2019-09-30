import { IonContent } from '@ionic/react';
import * as React from 'react';
import { RouteComponentProps, RouteProps } from 'react-router';
import { Routes, TopNav } from '../../components';
import { Confirm } from './confirm';
import { Register } from './register';

const routes: RouteProps[] = [
  { path: '/', exact: true, component: Register },
  { path: '/:binId', component: Confirm },
];

export default ({ match }: RouteComponentProps<{}>) => (
  <>
    <TopNav />

    <IonContent>
      <Routes base={match.url} routes={routes} />
    </IonContent>
  </>
);
