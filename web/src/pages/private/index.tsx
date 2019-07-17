import {
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
import { New } from './new';
import { Profile } from './profile';
import { Search } from './search';

export default class Private extends React.Component<RouteComponentProps> {
  render() {
    return (
      <>
        <Route exact path="/" render={() => <Redirect to="/listings" />} />

        <IonTabs>
          <IonRouterOutlet>
            <Route path="/:tab(listings)" exact component={MyListings} />
            <Route path="/:tab(profile)" exact component={Profile} />
            <Route path="/:tab(new)" exact component={New} />
            <Route path="/:tab(search)" component={Search} />
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="search" href="/search">
              <IonIcon name="search" />
              <IonLabel>Search</IonLabel>
            </IonTabButton>

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
      </>
    );
  }
}
