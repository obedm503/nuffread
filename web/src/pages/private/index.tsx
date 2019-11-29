import {
  IonIcon,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import { add, person, search } from 'ionicons/icons';
import * as React from 'react';
import { Redirect, Route } from 'react-router';
import { ListingPage } from '../../components/listing-page';
import { useRouter } from '../../state/router';
import { Book } from './book';
import { CreateModal } from './components/create';
import { Explore } from './explore';
import { Profile } from './profile';
import { Search } from './search';

const pages = {
  profile: () => <Profile />,
  explore: () => <Explore />,
  search: () => <Search />,
  listing: ({ match }) => (
    <ListingPage id={match.params.listingId} defaultHref="/explore" />
  ),
  book: ({ match }) => (
    <Book bookId={match.params.bookId} defaultHref="/explore" />
  ),
};

const validStarts = ['/explore', '/search', '/create', '/profile', '/p', '/b'];

export default React.memo(function Private() {
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
      <IonRouterOutlet>
        <Route path="/:tab(profile)" exact render={pages.profile} />
        <Route path="/:tab(explore)" exact render={pages.explore} />
        <Route path="/:tab(search)" exact render={pages.search} />
        <Route path="/:tab(p)/:listingId" component={pages.listing} />
        <Route path="/:tab(b)/:bookId" component={pages.book} />
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="explore" href="/explore">
          <IonIcon icon={search} ariaLabel="Explore" />
        </IonTabButton>

        {/* modal close button does not work without ref */}
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
