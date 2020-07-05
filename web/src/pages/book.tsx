import { RefresherEventDetail } from '@ionic/core';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonInfiniteScroll,
  IonItem,
  IonLabel,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonText,
} from '@ionic/react';
import gql from 'graphql-tag';
import { cartOutline } from 'ionicons/icons';
import range from 'lodash/range';
import React from 'react';
import { Redirect } from 'react-router';
import {
  Container,
  Error,
  GoToChat,
  ListWrapper,
  NavBar,
  SafeImg,
  SaveListingButton,
  useWillEnter,
} from '../components';
import { BOOK, LISTING } from '../queries';
import {
  IBook,
  IPaginatedListings,
  IPaginationInput,
  IQueryBookArgs,
} from '../schema.gql';
import { useLazyQuery, useRouter } from '../state';
import { conditionNames, paginated, queryLoading } from '../util';
import { Optional } from '../util.types';

const BookCard = React.memo<{
  book: IBook;
}>(function BookCard({ book }) {
  return (
    <IonCard color="white" className="book-card">
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

const priceBadge = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
};

const loadingDeals = range(10).map(n => (
  <IonItem key={n}>
    <IonLabel class="ion-text-wrap">
      <IonText color="danger" style={priceBadge}>
        <IonSkeletonText animated style={{ width: '2rem' }} />
      </IonText>
      <b>
        <IonSkeletonText animated style={{ width: '20%' }} />
      </b>
      <IonSkeletonText animated style={{ width: '30%' }} />
    </IonLabel>

    <IonButtons slot="end">
      <IonButton color="white" fill="clear">
        <IonIcon
          slot="icon-only"
          color="medium"
          icon={cartOutline}
          size="large"
        />
      </IonButton>
    </IonButtons>
  </IonItem>
));

const Deals: React.FC<{ listings?: IPaginatedListings; loading: boolean }> = ({
  listings,
  loading,
}) => {
  const { history } = useRouter();
  if (loading || !listings) {
    return <ListWrapper title="Deals">{loadingDeals}</ListWrapper>;
  }

  return (
    <ListWrapper title="Deals">
      {listings.items.map(listing => (
        <IonItem
          key={listing.id}
          onClick={() => history.push(`/p/${listing.id}`)}
          button
        >
          <IonLabel>
            <IonText color="danger" style={priceBadge}>
              ${listing.price / 100}
            </IonText>

            <br />

            {listing.condition ? (
              <b>
                {conditionNames[listing.condition]}
                <br />
              </b>
            ) : null}

            {listing.user?.name || listing.user?.email}
          </IonLabel>

          <IonButtons slot="end">
            <GoToChat listing={listing} />
            <SaveListingButton listing={listing} />
          </IonButtons>
        </IonItem>
      ))}
    </ListWrapper>
  );
};

const GET_BOOK_LISTINGS = gql`
  ${BOOK}
  ${LISTING}

  query GetBookListings($id: ID!, $offset: Int!) {
    book(id: $id) {
      ...Book
      listings(paginate: { offset: $offset }) {
        totalCount
        items {
          ...Listing
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

const GET_MORE_BOOK_LISTINGS = gql`
  ${LISTING}

  query GetMoreBookListings($id: ID!, $offset: Int!) {
    book(id: $id) {
      id
      listings(paginate: { offset: $offset }) {
        totalCount
        items {
          ...Listing
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
        query: GET_MORE_BOOK_LISTINGS,
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
                items: [
                  ...prev.book.listings.items,
                  ...fetchMoreResult.book.listings.items,
                ],
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

export const Book = React.memo<{
  bookId: string;
  defaultHref: Optional<string>;
}>(function Book({ bookId, defaultHref }) {
  const {
    error,
    loading,
    book,
    load,
    refresh,
    canFetchMore,
    fetchMore,
  } = useGetBookListings({ bookId });
  useWillEnter(load);

  if (error) {
    return <Error value={error} />;
  }

  if (!loading && !book) {
    return <Redirect to={defaultHref === false ? '/' : defaultHref} />;
  }

  return (
    <IonPage>
      <NavBar
        title="Deals"
        start={
          <IonButtons slot="start">
            <IonBackButton defaultHref={defaultHref || undefined} />
          </IonButtons>
        }
        end={null}
      />

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={refresh}>
          <IonRefresherContent />
        </IonRefresher>

        <Container>
          {book ? <BookCard book={book} /> : loadingDeals[0]}

          <Deals listings={book?.listings} loading={loading} />

          {canFetchMore ? (
            <IonInfiniteScroll onIonInfinite={fetchMore}>
              {loadingDeals}
            </IonInfiniteScroll>
          ) : null}
        </Container>
      </IonContent>
    </IonPage>
  );
});
