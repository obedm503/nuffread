import { QueryResult } from '@apollo/react-common';
import { RefresherEventDetail } from '@ionic/core';
import {
  IonContent,
  IonInfiniteScroll,
  IonItem,
  IonLabel,
  IonPage,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import { join } from 'path';
import * as React from 'react';
import {
  Container,
  ListingCard,
  ListWrapper,
  NavBar,
  useWillEnter,
} from '../../components';
import { SAVED_LISTINGS } from '../../queries';
import { IPaginationInput, IQuery } from '../../schema.gql';
import { useLazyQuery, useRouter } from '../../state';
import { paginated, queryLoading } from '../../util';
import { PaginatedRefresh } from '../../util.types';

const Listings = React.memo<Pick<QueryResult<IQuery>, 'data' | 'loading'>>(
  function Listings({ loading, data }) {
    const { history } = useRouter();
    const onClick = React.useCallback(
      (id: string) => history.push(join('/p', id)),
      [history],
    );

    if (loading || !(data?.me?.__typename === 'User')) {
      return <ListWrapper>{ListingCard.loading}</ListWrapper>;
    }

    if (!data.me.saved.items.length) {
      return (
        <ListWrapper>
          <IonItem>
            <IonLabel>You have not saved any posts.</IonLabel>
          </IonItem>
        </ListWrapper>
      );
    }

    return (
      <ListWrapper>
        {data.me.saved.items.map(listing => (
          <ListingCard key={listing.id} listing={listing} onClick={onClick} />
        ))}
      </ListWrapper>
    );
  },
);

const useSavedListings = (): PaginatedRefresh<IQuery> => {
  const [
    load,
    { error, data, loading, fetchMore, called, refetch },
  ] = useLazyQuery<IPaginationInput>(SAVED_LISTINGS, {
    variables: { offset: 0 },
  });
  const { totalCount, currentCount } = paginated(
    data?.me?.__typename === 'User' ? data.me.saved : undefined,
  );

  const getMore = React.useCallback(
    async e => {
      await fetchMore({
        variables: { offset: currentCount },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (
            !(fetchMoreResult?.me?.__typename === 'User') ||
            !(prev?.me?.__typename === 'User')
          ) {
            return prev;
          }
          return {
            ...prev,
            me: {
              ...prev.me,
              saved: {
                ...prev.me.saved,
                totalCount: fetchMoreResult.me.saved.totalCount,
                items: [
                  ...prev.me.saved.items,
                  ...fetchMoreResult.me.saved.items,
                ],
              },
            },
          };
        },
      });
      (e.target! as HTMLIonInfiniteScrollElement).complete();
    },
    [currentCount, fetchMore],
  );

  const refresh = React.useCallback(
    async (event: CustomEvent<RefresherEventDetail>) => {
      await refetch();
      event.detail.complete();
    },
    [refetch],
  );

  if (error) {
    throw error;
  }

  return {
    load,
    data,
    loading: queryLoading({ called, loading }),
    canFetchMore: currentCount < totalCount,
    fetchMore: getMore,
    refresh,
  };
};

export const Cart = React.memo(function Cart() {
  const {
    load,
    refresh,
    canFetchMore,
    fetchMore,
    loading,
    data,
  } = useSavedListings();
  useWillEnter(load);

  return (
    <IonPage>
      <NavBar title="Cart" />

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={refresh}>
          <IonRefresherContent />
        </IonRefresher>

        <Container>
          <Listings loading={loading} data={data} />

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
