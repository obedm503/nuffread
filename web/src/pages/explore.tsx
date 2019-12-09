import {
  IonButtons,
  IonContent,
  IonHeader,
  IonInfiniteScroll,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  useIonViewWillEnter,
} from '@ionic/react';
import React, { memo, useCallback } from 'react';
import {
  Container,
  DummySearchBar,
  IonButtonLink,
  ListingCard,
  Listings,
  TopNav,
  useTopListings,
} from '../components';
import { useRouter } from '../state/router';
import { useSearch } from '../state/search';
import { useLoggedIn } from '../state/user';

export const Explore = memo(function Explore() {
  const { onClick } = useSearch();
  const { history } = useRouter();
  const toSearch = useCallback(() => history.push({ pathname: '/search' }), [
    history,
  ]);

  const isLoggedIn = useLoggedIn();
  const {
    load,
    refresh,
    canFetchMore,
    fetchMore,
    loading,
    data,
  } = useTopListings();
  useIonViewWillEnter(load);

  return (
    <IonPage>
      <IonHeader>
        {isLoggedIn ? (
          <DummySearchBar onFocus={toSearch} />
        ) : (
          <TopNav homeHref={false}>
            <IonButtons slot="end">
              <IonButtonLink href="/login" color="primary">
                Login
              </IonButtonLink>
              <IonButtonLink href="/invite" color="primary" fill="solid">
                <b>Join</b>
              </IonButtonLink>
            </IonButtons>
          </TopNav>
        )}
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={refresh}>
          <IonRefresherContent />
        </IonRefresher>

        <Container>
          {isLoggedIn ? null : <DummySearchBar onFocus={toSearch} />}

          <Listings
            loading={loading}
            onClick={onClick}
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
