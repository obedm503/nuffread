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
import { personAdd } from 'ionicons/icons';
import memoize from 'lodash/memoize';
import * as React from 'react';
import { Redirect, Route } from 'react-router';
import { LogoutButton, Routes, TopNav } from '../../components';
import { RootPageProps } from '../../util.types';
import Invites from './invites';

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
            <Route path="/:tab(other)" exact>
              <div>other page</div>
            </Route>
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="invites" href="/invites">
              <IonIcon icon={personAdd}></IonIcon>
              <IonLabel>Invites</IonLabel>
            </IonTabButton>
            <IonTabButton tab="other" href="/other">
              <IonLabel>Other</IonLabel>
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
