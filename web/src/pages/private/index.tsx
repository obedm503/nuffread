import {
  IonIcon,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import { book, home, person } from 'ionicons/icons';
import * as React from 'react';
import { Route, Redirect } from 'react-router';
import { useRouter } from '../../state/router';
import { Detail, Home } from './home';
import { MyListings } from './listings';
import { Profile } from './profile';

const validStarts = ['/home', '/listings', '/profile'];

export default () => {
  const { location } = useRouter();
  const route = location.pathname;

  if (!validStarts.some(start => route.startsWith(start))) {
    return <Redirect to="/home"></Redirect>;
  }

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path="/:tab(listings)" exact component={MyListings} />
        <Route path="/:tab(profile)" exact component={Profile} />
        <Route path="/:tab(home)" exact component={Home} />
        <Route path="/:tab(home)/:listingId" component={Detail} />
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="home" href="/home">
          <IonIcon icon={home} ariaLabel="Home" />
        </IonTabButton>

        <IonTabButton tab="listings" href="/listings">
          <IonIcon icon={book} ariaLabel="Listings" />
        </IonTabButton>

        <IonTabButton tab="profile" href="/profile">
          <IonIcon icon={person} ariaLabel="Profile" />
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};
