import {
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonLabel,
  IonPopover,
} from '@ionic/react';
import * as React from 'react';
import { RouteComponentProps, RouteProps } from 'react-router';
import { Footer, IonItemLink, Routes, TopNav } from '../components';
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
          <Link href="/profile" icon="person">
            My Profile
          </Link>
          <Link href="/new" icon="add">
            New Listing
          </Link>
          <Link href="/listings" icon="book">
            My Listings
          </Link>
          <Logout />
        </IonPopover>
      </IonButton>
    );
  }
}

export const Sell: React.SFC<RouteComponentProps<{}>> = ({ match }) => (
  <>
    <TopNav>
      <IonButtons slot="end">
        <Ellipsis />
      </IonButtons>
    </TopNav>

    <IonContent>
      <Routes base={match.url} routes={routes} />
    </IonContent>

    <Footer />
  </>
);
