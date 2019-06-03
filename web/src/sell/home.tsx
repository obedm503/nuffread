import {
  IonContent,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import * as React from 'react';
import { Redirect, Route, RouteComponentProps } from 'react-router';
import { MyListings } from './listings';
import { Profile } from './profile';

export const Home: React.SFC<RouteComponentProps<{}>> = () => (
  <>
    <Route exact path="/" render={() => <Redirect to="/listings" />} />

    <IonContent>
      <IonTabs>
        <IonRouterOutlet>
          <Route path="/:tab(listings)" exact component={MyListings} />
          <Route path="/:tab(profile)" exact component={Profile} />
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="listings" href="/listings">
            <IonIcon name="book" />
            <IonLabel>Listings</IonLabel>
          </IonTabButton>

          <IonTabButton tab="profile" href="/profile">
            <IonIcon name="person" />
            <IonLabel>Profile</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonContent>
  </>
);
