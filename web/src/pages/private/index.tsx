import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import { book, person, search } from 'ionicons/icons';
import * as React from 'react';
import { Redirect, Route } from 'react-router';
import { MyListings } from './listings';
import { Profile } from './profile';
import { Detail, Search } from './search';

export default class Private extends React.PureComponent {
  render() {
    return (
      <IonTabs>
        <IonRouterOutlet>
          <Redirect from="/" exact to="/search" />
          <Route path="/:tab(listings)" exact component={MyListings} />
          <Route path="/:tab(profile)" exact component={Profile} />
          <Route path="/:tab(search)" exact component={Search} />
          <Route path="/:tab(search)/:listingId" component={Detail} />
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="search" href="/search">
            <IonIcon icon={search} />
            <IonLabel>Search</IonLabel>
          </IonTabButton>

          <IonTabButton tab="listings" href="/listings">
            <IonIcon icon={book} />
            <IonLabel>Listings</IonLabel>
          </IonTabButton>

          <IonTabButton tab="profile" href="/profile">
            <IonIcon icon={person} />
            <IonLabel>Profile</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    );
  }
}
