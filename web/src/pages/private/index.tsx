import {
  IonIcon,
  IonLabel,
  IonPage,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import { book, person, search } from 'ionicons/icons';
import * as React from 'react';
import { Redirect, Route } from 'react-router';
import { MyListings } from './listings';
import { New } from './new';
import { Profile } from './profile';
import { Search } from './search';

export default class Private extends React.PureComponent {
  render() {
    return (
      <>
        <IonPage id="main">
          <IonTabs>
            <IonRouterOutlet>
              <Redirect from="/" exact to="/listings" />
              <Route path="/:tab(listings)" exact component={MyListings} />
              <Route path="/:tab(profile)" exact component={Profile} />
              <Route path="/:tab(new)" exact component={New} />
              <Route path="/:tab(search)" component={Search} />
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
        </IonPage>
      </>
    );
  }
}
