import {
  IonButtons,
  IonContent,
  IonInfiniteScroll,
  IonPage,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import { join } from 'path';
import React from 'react';
import {
  Container,
  DummySearchBar,
  IonButtonLink,
  ListingCard,
  Listings,
  NavBar,
  useTopListings,
  useWillEnter,
} from '../components';
import { useLoggedIn, useRouter } from '../state';

export const Explore = React.memo(function Explore() {
  const { history } = useRouter();
  const toListing = React.useCallback(
    (id: string) => history.push({ pathname: join('/p', id) }),
    [history],
  );
  const toSearch = React.useCallback(
    () => history.push({ pathname: '/search' }),
    [history],
  );

  const isLoggedIn = useLoggedIn();
  const {
    load,
    refresh,
    canFetchMore,
    fetchMore,
    loading,
    data,
  } = useTopListings();
  useWillEnter(load);

  return (
    <IonPage>
      {isLoggedIn ? (
        // <IonHeader>
        //   <Container className="no-padding">
        //     <DummySearchBar onFocus={toSearch} />
        //   </Container>
        // </IonHeader>
        <NavBar title="Explore" />
      ) : (
        <NavBar
          title="Explore"
          end={
            <IonButtons slot="end">
              <IonButtonLink href="/login" color="primary">
                Login
              </IonButtonLink>
              <IonButtonLink href="/join" color="primary" fill="solid">
                <b>Join</b>
              </IonButtonLink>
            </IonButtons>
          }
        />
      )}

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={refresh}>
          <IonRefresherContent />
        </IonRefresher>

        <Container>
          {isLoggedIn ? null : <DummySearchBar onFocus={toSearch} />}

          <Listings
            loading={loading}
            onClick={toListing}
            listings={data}
            component={ListingCard}
          />

          {canFetchMore ? (
            <IonInfiniteScroll onIonInfinite={fetchMore}>
              {ListingCard.loading}
            </IonInfiniteScroll>
          ) : null}
        </Container>
      </IonContent>
    </IonPage>
  );
});
