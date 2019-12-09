import { RefresherEventDetail } from '@ionic/core';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonInfiniteScroll,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  useIonViewWillEnter,
} from '@ionic/react';
import gql from 'graphql-tag';
import React, { FC, memo } from 'react';
import { Redirect } from 'react-router';
import {
  Container,
  Error,
  ListingBasic,
  ListWrapper,
  TopNav,
} from '../components';
import { BASIC_LISTING, BOOK } from '../queries';
import { IBook, IPaginationInput, IQueryBookArgs } from '../schema.gql';
import { useLazyQuery } from '../state/apollo';
import { useRouter } from '../state/router';
import { Optional, queryLoading } from '../util';

const MoreDeals: FC<{ book?: IBook; loading: boolean }> = ({
  book,
  loading,
}) => {
  const { history } = useRouter();
  if (loading || !book) {
    return ListingBasic.loading;
  }

  return (
    <ListWrapper title="Deals">
      {book.listings.items.map(listing => (
        <ListingBasic
          key={listing.id}
          listing={listing}
          onClick={() => history.push(`/p/${listing.id}`)}
        />
      ))}
    </ListWrapper>
  );
};

const GET_BOOK_LISTINGS = gql`
  ${BOOK}
  ${BASIC_LISTING}

  query GetBookListings($id: ID!, $offset: Int!) {
    book(id: $id) {
      ...Book

      listings(paginate: { offset: $offset }) {
        totalCount
        items {
          ...BasicListing
        }
      }
    }
  }
`;

const useGetBookListings = ({ bookId }) => {
  const [
    load,
    { data, loading, error, called, fetchMore, refetch },
  ] = useLazyQuery<IQueryBookArgs & IPaginationInput>(GET_BOOK_LISTINGS, {
    variables: { id: bookId, offset: 0 },
  });

  const book = (data && data.book) || undefined;
  const currentCount = (book && book.listings.items.length) || 0;
  const totalCount = (book && book.listings.totalCount) || 0;

  const getMore = React.useCallback(
    async e => {
      await fetchMore<keyof (IQueryBookArgs & IPaginationInput)>({
        variables: { id: bookId, offset: currentCount },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult || !fetchMoreResult.book || !prev.book) {
            return prev;
          }

          return {
            ...prev,
            book: {
              ...prev.book,
              listings: {
                __typename: 'PaginatedListings',
                totalCount: fetchMoreResult.book.listings.totalCount,
                items: [...prev.top.items, ...fetchMoreResult.top.items],
              },
            },
          };
        },
      });
      (e.target! as HTMLIonInfiniteScrollElement).complete();
    },
    [fetchMore, currentCount, bookId],
  );

  const refresh = React.useCallback(
    async (event: CustomEvent<RefresherEventDetail>) => {
      await refetch();
      event.detail.complete();
    },
    [refetch],
  );

  return {
    load,
    refresh,
    fetchMore: getMore,
    canFetchMore: currentCount < totalCount,
    loading: queryLoading({ called, loading }),
    error,
    book,
  };
};

export const Book = memo<{ bookId: string; defaultHref: Optional<string> }>(
  function Book({ bookId, defaultHref }) {
    const {
      error,
      loading,
      book,
      load,
      refresh,
      canFetchMore,
      fetchMore,
    } = useGetBookListings({ bookId });
    useIonViewWillEnter(load);

    if (error) {
      return <Error value={error} />;
    }

    if (!loading && !book) {
      return <Redirect to={defaultHref === false ? '/' : defaultHref} />;
    }

    return (
      <IonPage>
        <TopNav homeHref="/" title="Deals">
          <IonButtons slot="start">
            <IonBackButton defaultHref={defaultHref || undefined} />
          </IonButtons>
        </TopNav>

        <IonContent>
          <IonRefresher slot="fixed" onIonRefresh={refresh}>
            <IonRefresherContent />
          </IonRefresher>

          <Container>
            <MoreDeals book={book} loading={loading} />

            {canFetchMore ? (
              <IonInfiniteScroll onIonInfinite={fetchMore}>
                {ListingBasic.loading}
              </IonInfiniteScroll>
            ) : null}
          </Container>
        </IonContent>
      </IonPage>
    );
  },
);
