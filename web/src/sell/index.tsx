import {
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonLabel,
  IonPopover,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import * as React from 'react';
import { Redirect, Route, RouteComponentProps } from 'react-router';
import { IonItemLink, TopNav } from '../components';
import { Logout } from '../logout';
import { Listings } from './listings';
import { Profile } from './profile';

const Link = ({ href, icon, children }) => (
  <IonItemLink href={href}>
    <IonIcon slot="start" name={icon} />
    <IonLabel>{children}</IonLabel>
  </IonItemLink>
);

class Ellipsis extends React.Component {
  state = { open: false };
  open = () => this.setState({ open: !this.state.open });
  close = () => this.setState({ open: false });
  render() {
    return (
      <IonButton onClick={this.open}>
        <IonIcon name="more" />
        <IonPopover isOpen={this.state.open} onDidDismiss={this.close}>
          <Link href="/new" icon="add">
            New Listing
          </Link>
          <Logout />
        </IonPopover>
      </IonButton>
    );
  }
}

export const Sell: React.SFC<RouteComponentProps<{}>> = () => (
  <>
    <Route exact path="/" render={() => <Redirect to="/listings" />} />

    <TopNav>
      <IonButtons slot="end">
        <Ellipsis />
      </IonButtons>
    </TopNav>

    <IonContent>
      <IonTabs>
        <IonRouterOutlet>
          <Route path="/:tab(listings)" exact component={Listings} />
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
