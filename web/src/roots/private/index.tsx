import {
  IonIcon,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import { add, cartOutline, person, search } from 'ionicons/icons';
import memoizeOne from 'memoize-one';
import * as React from 'react';
import { Redirect, RouteProps } from 'react-router';
import { mapRoutes, Routes } from '../../components';
import { Book } from '../../pages/book';
import { Explore } from '../../pages/explore';
import { Listing } from '../../pages/listing';
import { Search } from '../../pages/search';
import { useRootValidator } from '../../state';
import { RootPageProps } from '../../util.types';
import { Cart } from './cart';
import { CreateModal } from './components/create';
import { Profile } from './profile';

const routes: RouteProps[] = [
  { path: '/:tab(explore)', exact: true, render: () => <Explore /> },
  { path: '/search', exact: true, render: () => <Search /> },
  // keep /saved in case links exists in the wild
  { path: '/:tab(saved)', exact: true, render: () => <Redirect to="/cart" /> },
  { path: '/:tab(cart)', exact: true, render: () => <Cart /> },
  { path: '/:tab(profile)', exact: true, render: () => <Profile /> },
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

const validRoots = [
  'explore',
  'search',
  'create',
  'saved',
  'cart',
  'profile',
  'p',
  'b',
];

const Private = React.memo(function Private() {
  const [isOpen, setModalOpen] = React.useState(false);
  const closeModal = React.useCallback(() => setModalOpen(false), []);
  const showModal = React.useCallback(e => {
    e.preventDefault();
    setModalOpen(true);
  }, []);

  if (!useRootValidator({ validRoots })) {
    return <Redirect to="/explore" />;
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

        <IonTabButton tab="cart" href="/cart">
          <IonIcon icon={cartOutline} ariaLabel="Cart" />
        </IonTabButton>

        <IonTabButton tab="profile" href="/profile">
          <IonIcon icon={person} ariaLabel="Profile" />
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
});

const getRoutes = memoizeOne(globalRoutes =>
  globalRoutes.concat({ path: '/', component: Private }),
);

export default React.memo<RootPageProps>(function({ globalRoutes }) {
  return <Routes routes={getRoutes(globalRoutes)} />;
});
