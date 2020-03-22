import { IonBackButton, IonButtons, IonContent, IonPage } from '@ionic/react';
import memoize from 'lodash/memoize';
import React from 'react';
import { Redirect, RouteProps } from 'react-router';
import { Container, IonRoutes, RequestInvite, TopNav } from '../../components';
import { Book } from '../../pages/book';
import { Explore } from '../../pages/explore';
import { Listing } from '../../pages/listing';
import { Search } from '../../pages/search';
import { useRootValidator, useUser } from '../../state';
import { RootPageProps } from '../../util.types';

const Invite = () => {
  const user = useUser();
  if (user) {
    return <Redirect to="/" />;
  }
  return (
    <IonPage>
      <TopNav homeHref="/">
        <IonButtons slot="start">
          <IonBackButton />
        </IonButtons>
      </TopNav>

      <IonContent>
        <Container>
          <RequestInvite />
        </Container>
      </IonContent>
    </IonPage>
  );
};

const getRoutes = memoize(globalRoutes => {
  const routes: RouteProps[] = [
    { path: '/explore', exact: true, render: () => <Explore /> },
    { path: '/search', exact: true, render: () => <Search /> },
    { path: '/invite', exact: true, render: () => <Invite /> },
    {
      path: '/p/:listingId',
      component: ({ match }) => (
        <Listing id={match.params.listingId} defaultHref="/explore" />
      ),
    },
    {
      path: '/b/:bookId',
      component: ({ match }) => (
        <Book bookId={match.params.bookId} defaultHref="/explore" />
      ),
    },
    { path: '/', exact: true, render: () => <Redirect to="/explore" /> },
  ];
  return globalRoutes.concat(routes);
});

const validRoots = [
  'explore',
  'search',
  'p',
  'b',
  'invite',
  'login',
  'admin',
  'join',
  'reset',
];

export default React.memo<RootPageProps>(function({ globalRoutes }) {
  if (!useRootValidator({ validRoots })) {
    return <Redirect to="/explore" />;
  }

  return <IonRoutes routes={getRoutes(globalRoutes)} />;
});
