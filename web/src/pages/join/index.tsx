import { IonContent } from '@ionic/react';
import * as React from 'react';
import { RouteProps } from 'react-router';
import { Routes, TopNav } from '../../components';
import { Confirm } from './confirm';
import { Register } from './register';

const routes: RouteProps[] = [
  { path: '/', exact: true, component: Register },
  { path: '/:confirmationCode', component: Confirm },
];

export default () => (
  <>
    <TopNav homeHref="/" />

    <IonContent>
      <Routes routes={routes} />
    </IonContent>
  </>
);
