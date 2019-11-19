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
import { CreateModal } from './components/create';
import { Explore } from './explore';
import { Profile } from './profile';
import { Search } from './search';

const pages = {
  profile: () => <Profile />,
  explore: () => <Explore />,
  search: () => <Search />,
};

const validStarts = ['/explore', '/search', '/create', '/profile'];

export default React.memo(function Private() {
  const { location } = useRouter();
  const route = location.pathname;
  const [isOpen, setModalOpen] = React.useState(false);
  const createButton = React.useRef<HTMLIonTabButtonElement>(null);

  React.useEffect(() => {
    const button = createButton.current;
    if (!button) {
      return;
    }
    const onClick = (e: MouseEvent) => {
      e.preventDefault();
      setModalOpen(true);
    };
    button.addEventListener('click', onClick);
    return () => {
      button.removeEventListener('click', onClick);
    };
  }, [createButton]);

  const closeModal = React.useCallback(() => setModalOpen(false), [
    setModalOpen,
  ]);

  if (!validStarts.some(start => route.startsWith(start))) {
    return <Redirect to="/explore"></Redirect>;
  }

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path="/:tab(profile)" exact render={pages.profile} />
        <Route path="/:tab(explore)" exact render={pages.explore} />
        <Route path="/:tab(search)" exact render={pages.search} />
        <Route
          path="/:tab(search)/:listingId"
          component={({ match }) => (
            <ListingPage id={match.params.listingId} base="/search" />
          )}
        />
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="explore" href="/explore">
          <IonIcon icon={search} ariaLabel="Explore" />
        </IonTabButton>

        <IonTabButton tab="create" ref={createButton}>
          {isOpen ? <CreateModal closeModal={closeModal} /> : null}

          <IonIcon icon={add} ariaLabel="Create" />
        </IonTabButton>

        <IonTabButton tab="profile" href="/profile">
          <IonIcon icon={person} ariaLabel="Profile" />
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
});
