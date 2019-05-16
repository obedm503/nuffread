import { IonButtons, IonContent } from '@ionic/react';
import * as React from 'react';
import { RouteComponentProps, RouteProps } from 'react-router';
import { Footer, IonButtonLink, Routes, TopNav } from '../components';
import { Confirm } from './confirm';
import { Home } from './home';
import { Pricing } from './pricing';
import { Register } from './register';

const routes: RouteProps[] = [
  { path: '/pricing', component: Pricing },
  { path: '/signup', component: Register },
  { path: '/confirm/:binId?', component: Confirm },
  { path: '/', component: Home },
];

export const Join: React.SFC<RouteComponentProps<{}>> = ({
  match,
  location,
}) => (
  <>
    <TopNav>
      <IonButtons slot="end">
        <IonButtonLink href="/">Search</IonButtonLink>
        <IonButtonLink href="/join/pricing">Pricing</IonButtonLink>
        {location.pathname.endsWith('/join/signup') ? null : (
          <IonButtonLink href="/join/signup">Signup</IonButtonLink>
        )}
      </IonButtons>
    </TopNav>

    <IonContent>
      <Routes base={match.url} routes={routes} />
    </IonContent>

    <Footer />
  </>
);
