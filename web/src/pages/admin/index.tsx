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
import * as React from 'react';
import { Redirect, Route } from 'react-router';
import { LogoutButton, TopNav } from '../../components';
import Invites from './invites';

export default () => {
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
};
