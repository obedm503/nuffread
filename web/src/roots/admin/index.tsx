import {
  IonButtons,
  IonContent,
  IonIcon,
  IonLabel,
  IonPage,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import { people, personAdd, school } from 'ionicons/icons';
import memoize from 'lodash/memoize';
import * as React from 'react';
import { Redirect, Route } from 'react-router';
import { LogoutButton, Routes, TopNav } from '../../components';
import { RootPageProps } from '../../util.types';
import Users from './users';
import Schools from './schools';
import Sessions from './sessions';

const Admin = React.memo(() => {
  return (
    <IonPage>
      <TopNav homeHref="/">
        <IonButtons slot="end">
          <LogoutButton />
        </IonButtons>
      </TopNav>

      <IonContent>
        <IonTabs>
          <IonRouterOutlet>
            <Redirect from="/" exact to="/users" />
            <Route path="/:tab(users)" exact component={Users} />
            <Route path="/:tab(schools)" exact component={Schools} />
            <Route path="/:tab(sessions)" exact component={Sessions} />
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="users" href="/users">
              <IonIcon icon={personAdd} />
              <IonLabel>Users</IonLabel>
            </IonTabButton>
            <IonTabButton tab="schools" href="/schools">
              <IonIcon icon={school} />
              <IonLabel>Schools</IonLabel>
            </IonTabButton>
            <IonTabButton tab="sessions" href="/sessions">
              <IonIcon icon={people} />
              <IonLabel>Active Users</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonContent>
    </IonPage>
  );
});

const getRoutes = memoize(globalRoutes =>
  globalRoutes.concat({ path: '/', component: Admin }),
);

export default React.memo<RootPageProps>(function({ globalRoutes }) {
  return <Routes routes={getRoutes(globalRoutes)} />;
});
