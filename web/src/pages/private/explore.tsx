import {
  IonContent,
  IonInfiniteScroll,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  useIonViewDidEnter,
} from '@ionic/react';
import React, { memo, useCallback } from 'react';
import {
  Container,
  Error,
  ListingCard,
  Listings,
  SearchBar,
  TopNav,
  useTopListings,
} from '../../components';
import { useRouter } from '../../state/router';
import { useSearch } from '../../state/search';

export const Explore = memo(function Explore() {
  const { onClick } = useSearch('/search');
  const { history } = useRouter();
  const toSearch = useCallback(() => history.push({ pathname: '/search' }), [
    history,
  ]);

  const {
    load,
    refresh,
    error,
    canFetchMore,
    fetchMore,
    loading,
    data,
  } = useTopListings();
  useIonViewDidEnter(load);

  if (error) {
    return <Error value={error} />;
  }

  return (
    <IonPage>
      <TopNav
        title="Explore"
        homeHref="/explore"
        toolbar={
          <Container className="no-v-padding">
            <SearchBar onFocus={toSearch} searchValue="" />
          </Container>
        }
      />

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={refresh}>
          <IonRefresherContent />
        </IonRefresher>

        <Container>
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
