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
import Invites from './invites';
import Schools from './schools';
import Sessions from './sessions';

const Admin = React.memo(() => {
  return (
    <IonPage>
      <TopNav homeHref="/invites">
        <IonButtons slot="end">
          <LogoutButton />
        </IonButtons>
      </TopNav>

      <IonContent>
        <IonTabs>
          <IonRouterOutlet>
            <Redirect from="/" exact to="/invites" />
            <Route path="/:tab(invites)" exact component={Invites} />
            <Route path="/:tab(schools)" exact component={Schools} />
            <Route path="/:tab(sessions)" exact component={Sessions} />
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="invites" href="/invites">
              <IonIcon icon={personAdd} />
              <IonLabel>Invites</IonLabel>
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
