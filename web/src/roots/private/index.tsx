import {
  IonIcon,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import { add, person, search } from 'ionicons/icons';
import memoize from 'lodash/memoize';
import * as React from 'react';
import { Redirect, RouteProps } from 'react-router';
import { mapRoutes, Routes } from '../../components';
import { Book } from '../../pages/book';
import { Explore } from '../../pages/explore';
import { Listing } from '../../pages/listing';
import { Search } from '../../pages/search';
import { useRouter } from '../../state/router';
import { RootPageProps } from '../../util';
import { CreateModal } from './components/create';
import { Profile } from './profile';

const routes: RouteProps[] = [
  { path: '/:tab(profile)', exact: true, render: () => <Profile /> },
  { path: '/:tab(explore)', exact: true, render: () => <Explore /> },
  { path: '/search', exact: true, render: () => <Search /> },
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
];

const validStarts = ['/explore', '/search', '/create', '/profile', '/p', '/b'];

const Private = React.memo(function Private() {
  const { location } = useRouter();
  const route = location.pathname;

  const [isOpen, setModalOpen] = React.useState(false);
  const closeModal = React.useCallback(() => setModalOpen(false), []);
  const showModal = React.useCallback(() => setModalOpen(true), []);

  if (!validStarts.some(start => route.startsWith(start))) {
    return <Redirect to="/explore"></Redirect>;
  }

  return (
    <IonTabs>
      <IonRouterOutlet>{mapRoutes({ routes }, true)}</IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="explore" href="/explore">
          <IonIcon icon={search} ariaLabel="Explore" />
        </IonTabButton>

        <IonTabButton onClick={showModal}>
          {isOpen ? <CreateModal isOpen onClose={closeModal} /> : null}

          <IonIcon icon={add} ariaLabel="Create" />
        </IonTabButton>

        <IonTabButton tab="profile" href="/profile">
          <IonIcon icon={person} ariaLabel="Profile" />
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
});

const getRoutes = memoize(globalRoutes =>
  globalRoutes.concat({ path: '/', component: Private }),
);

export default React.memo<RootPageProps>(function({ globalRoutes }) {
  return <Routes routes={getRoutes(globalRoutes)} />;
});
