import {
  IonIcon,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import {
  addOutline,
  cartOutline,
  chatbubblesOutline,
  homeOutline,
} from 'ionicons/icons';
import memoizeOne from 'memoize-one';
import * as React from 'react';
import { Redirect, RouteProps } from 'react-router';
import { mapRoutes, Routes } from '../../components';
import { Book } from '../../pages/book';
import { Explore } from '../../pages/explore';
import { Listing } from '../../pages/listing';
import { Search } from '../../pages/search';
import { useIsAdmin, useRootValidator } from '../../state';
import { RootPageProps } from '../../util.types';
import { Cart } from './cart';
import { Chat } from './chat';
import { CreateModal } from './components/create';
import { LiveChats } from './components/live-chats';
import { Profile } from './profile';
import { Thread } from './thread';

const routes: RouteProps[] = [
  { path: '/:tab(explore)', exact: true, render: () => <Explore /> },
  { path: '/search', exact: true, render: () => <Search /> },
  // keep /saved in case links exists in the wild
  { path: '/:tab(saved)', exact: true, render: () => <Redirect to="/cart" /> },
  { path: '/:tab(cart)', exact: true, render: () => <Cart /> },
  { path: '/:tab(chat)', exact: true, render: () => <Chat /> },
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
  {
    path: '/chat/:threadId',
    component: ({ match }) => (
      <Thread threadId={match.params.threadId} defaultHref="/chat" />
    ),
  },
];

const validRoots = [
  'explore',
  'search',
  'create',
  'saved',
  'cart',
  'chat',
  'profile',
  'p',
  'b',
];

const mapRoutesMemo = memoizeOne(mapRoutes);

const Private = React.memo(function Private() {
  const [isOpen, setModalOpen] = React.useState(false);
  const closeModal = React.useCallback(() => setModalOpen(false), []);
  const showModal = React.useCallback(e => {
    e.preventDefault();
    setModalOpen(true);
  }, []);
  const isAdmin = useIsAdmin();

  if (!useRootValidator({ validRoots })) {
    return <Redirect to="/explore" />;
  }

  return (
    <>
      <LiveChats />
      <IonTabs>
        <IonRouterOutlet>{mapRoutesMemo({ routes }, true)}</IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="explore" href="/explore">
            <IonIcon icon={homeOutline} ariaLabel="Explore" />
          </IonTabButton>

          {isAdmin ? (
            <IonTabButton tab="cart" href="/cart">
              <IonIcon icon={cartOutline} ariaLabel="Cart" />
            </IonTabButton>
          ) : null}

          <IonTabButton onClick={showModal}>
            {isOpen ? <CreateModal isOpen onClose={closeModal} /> : null}

            <IonIcon icon={addOutline} ariaLabel="Create" />
          </IonTabButton>

          {!isAdmin ? (
            <IonTabButton tab="cart" href="/cart">
              <IonIcon icon={cartOutline} ariaLabel="Cart" />
            </IonTabButton>
          ) : null}

          {isAdmin ? (
            <IonTabButton tab="chat" href="/chat">
              <IonIcon icon={chatbubblesOutline} ariaLabel="Chat" />
            </IonTabButton>
          ) : null}
        </IonTabBar>
      </IonTabs>
    </>
  );
});

const getRoutes = memoizeOne(globalRoutes =>
  globalRoutes.concat({ path: '/', component: Private }),
);

export default React.memo<RootPageProps>(function ({ globalRoutes }) {
  return <Routes routes={getRoutes(globalRoutes)} />;
});
