import {
  IonContent,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonPopover,
  IonItemDivider,
} from '@ionic/react';
import * as React from 'react';
import { RouteComponentProps, RouteProps } from 'react-router';
import { NavbarLink, Routes, TopNav } from '../components';
import { Logout } from '../logout';
import { Home } from './home';
import { Listings } from './listings';
import { New } from './new';
import { Profile } from './profile';

const routes: RouteProps[] = [
  { path: '/profile', exact: true, component: Profile },
  { path: '/listings', exact: true, component: Listings },
  { path: '/new', exact: true, component: New },
  { path: '/', component: Home },
];

export const Sell: React.SFC<RouteComponentProps<{}>> = ({ match }) => (
  <>
    <IonToolbar>
      <IonTitle>nuffread</IonTitle>

      <IonButtons slot="end">
        <IonButton>
          <IonIcon name="ellipsis" />
          <IonPopover isOpen={true} onDidDismiss={() => {}}>
            <IonButtons>
              <IonButton href="/profile">My Profile</IonButton>
              <IonButton href="/new">New Listing</IonButton>
              <IonButton href="/listings">My Listings</IonButton>
              <IonItemDivider />
              <Logout />
            </IonButtons>
            <p>This is popover content</p>
          </IonPopover>
        </IonButton>
      </IonButtons>
    </IonToolbar>

    <IonContent>
      <Routes base={match.url} routes={routes} />
    </IonContent>
  </>
);
