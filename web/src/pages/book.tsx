import { RefresherEventDetail } from '@ionic/core';
import {
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonInfiniteScroll,
  IonItem,
  IonLabel,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonText,
  useIonViewWillEnter,
} from '@ionic/react';
import gql from 'graphql-tag';
import React, { FC, memo } from 'react';
import { Redirect } from 'react-router';
import {
  Container,
  Error,
  ListingBasic,
  ListingCard,
  ListWrapper,
  SafeImg,
  TopNav,
} from '../components';
import { SaveListingButton } from '../components/save-listing-button';
import { BASIC_LISTING, BOOK } from '../queries';
import {
  IBook,
  IPaginatedListings,
  IPaginationInput,
  IQueryBookArgs,
} from '../schema.gql';
import { useLazyQuery, useRouter } from '../state';
import { paginated, queryLoading } from '../util';
import { Optional } from '../util.types';

const BookCard = React.memo<{
  book: IBook;
}>(function BookCard({ book }) {
  return (
    <IonCard color="white" className="book-cover-card">
      <IonCardHeader>
        <IonCardTitle>{book.title}</IonCardTitle>

        {book.subTitle ? (
          <IonCardSubtitle>{book.subTitle}</IonCardSubtitle>
        ) : null}
      </IonCardHeader>

      <IonCardContent>
        <div className="book-cover-card --has-ribbon">
          <SafeImg
            src={book.thumbnail || undefined}
            alt={[book.title, book.subTitle].join(' ')}
            placeholder="/img/book.png"
          />
        </div>
      </IonCardContent>

      <IonItem lines="inset">
        <IonLabel className="ion-text-wrap">
          <b>{book.authors.join(', ')}</b>
        </IonLabel>
      </IonItem>

      <IonItem lines="none">
        <IonLabel className="ion-text-wrap">
          {book.isbn.map(isbn => (
            <small key={isbn}>
              <b>ISBN: </b> {isbn}
              <br />
            </small>
          ))}

          {book.publishedAt ? (
            <small>
              <b>Published on: </b>
              {new Date(book.publishedAt).toLocaleDateString()}
              <br />
            </small>
          ) : null}
        </IonLabel>
      </IonItem>
    </IonCard>
  );
});

const Deals: FC<{ listings?: IPaginatedListings; loading: boolean }> = ({
  listings,
  loading,
}) => {
  const { history } = useRouter();
  if (loading || !listings) {
    return ListingBasic.loading;
  }

  return (
    <ListWrapper title="Deals">
      {listings.items.map(listing => (
        <IonItem
          key={listing.id}
          onClick={() => history.push(`/p/${listing.id}`)}
          button
        >
          <IonText
            slot="start"
            color="danger"
            style={{ fontSize: '1.5rem', fontWeight: 'bold' }}
          >
            ${listing.price / 100}
          </IonText>

          <p>
            {/* <b>Used - Like New</b>
            <br /> */}
            {listing.user?.name || listing.user?.email}
          </p>

          <IonButtons slot="end">
            <SaveListingButton listing={listing} />
          </IonButtons>
        </IonItem>
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

          user {
            id
            name
            email
          }
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

  const book = data?.book || undefined;
  const { currentCount, totalCount } = paginated(book?.listings);

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
        <TopNav homeHref={false} title="Deals">
          <IonButtons slot="start">
            <IonBackButton defaultHref={defaultHref || undefined} />
          </IonButtons>
        </TopNav>

        <IonContent>
          <IonRefresher slot="fixed" onIonRefresh={refresh}>
            <IonRefresherContent />
          </IonRefresher>

          <Container>
            {book ? <BookCard book={book} /> : ListingCard.loading[0]}

            <Deals listings={book?.listings} loading={loading} />

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
