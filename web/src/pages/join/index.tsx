import { IonContent } from '@ionic/react';
import * as React from 'react';
import { Redirect, RouteProps } from 'react-router';
import { Routes, TopNav } from '../../components';
import { useUser } from '../../state/user';
import { Confirm } from './confirm';
import { Register } from './register';

const routes: RouteProps[] = [
  { path: '/', exact: true, component: Register },
  { path: '/:confirmationCode', component: Confirm },
];

export default React.memo(function Join() {
  const user = useUser();
  if (user) {
    return <Redirect to="/" />;
  }
  return (
    <>
      <TopNav homeHref="/" />

      <IonContent>
        <Routes routes={routes} />
      </IonContent>
    </>
  );
});
