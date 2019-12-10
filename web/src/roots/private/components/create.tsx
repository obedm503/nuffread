import { useApolloClient } from '@apollo/react-hooks';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonTextarea,
  IonToolbar,
} from '@ionic/react';
import gql from 'graphql-tag';
import { close, logoUsd } from 'ionicons/icons';
import * as React from 'react';
import { Error, Loading, Title } from '../../../components';
import { ListWrapper } from '../../../components/list-wrapper';
import { BookBasic, ListingBasic } from '../../../components/listing-basic';
import { ListingCard } from '../../../components/listing-card';
import { SearchBar } from '../../../components/search-bar';
import { CREATE_LISTING, MY_LISTINGS, SEARCH_GOOGLE } from '../../../queries';
import {
  IGoogleBook,
  IListingInput,
  IMutation,
  IQuery,
  IQueryGoogleBookArgs,
  IQuerySearchGoogleArgs,
} from '../../../schema.gql';
import { useMutation, useQuery } from '../../../state/apollo';
import { tracker } from '../../../state/tracker';

const SearchResultBook: React.FC<{
  book: IGoogleBook;
  active: boolean;
  onClick?;
}> = ({ book, active, onClick }) => (
  <BookBasic
    book={book}
    color={active ? 'primary' : undefined}
    onClick={onClick}
  >
    <br />
    <small>{book.isbn.join(', ')}</small>
  </BookBasic>
);

const SearchResults = React.memo<{
  onClick: (book: IGoogleBook) => void;
  searchValue: string;
  activeId?: string;
  isFocused: boolean;
}>(({ onClick, searchValue, activeId, isFocused }) => {
  const { error, data, loading } = useQuery<IQuerySearchGoogleArgs>(
    SEARCH_GOOGLE,
    { fetchPolicy: 'no-cache', variables: { query: searchValue } },
  );

  if (error) {
    return <Error value={error} />;
  }

  const title = 'Results for: ' + searchValue;
  const books = data?.searchGoogle;

  if (loading || !Array.isArray(books)) {
    return <ListWrapper title={title}>{ListingBasic.loading}</ListWrapper>;
  }

  if (!books.length) {
    return (
      <ListWrapper title={title}>
        <IonItem color="white">
          <IonLabel>Found nothing...</IonLabel>
        </IonItem>
      </ListWrapper>
    );
  }

  if (activeId && !isFocused) {
    const activeBook = books.find(book => book.googleId === activeId);
    if (!activeBook) {
      return null;
    }
    return (
      <ListWrapper title={title}>
        <SearchResultBook book={activeBook} active />
      </ListWrapper>
    );
  }

  return (
    <ListWrapper title={title}>
      {books.map(book => {
        if (!book) {
          return null;
        }
        return (
          <SearchResultBook
            key={book.googleId}
            onClick={() => onClick(book)}
            book={book}
            active={activeId === book.googleId}
          />
        );
      })}
    </ListWrapper>
  );
});

const PickBook = React.memo<{
  onClick: (book: IGoogleBook) => void;
  onFocus;
  activeId?: string;
  isFocused: boolean;
}>(({ onClick, onFocus, activeId, isFocused }) => {
  const [searchValue, setSearchValue] = React.useState('');
  return (
    <>
      <SearchBar
        onChange={setSearchValue}
        searchValue={searchValue}
        onFocus={onFocus}
      />

      {searchValue ? (
        <SearchResults
          onClick={onClick}
          searchValue={searchValue}
          activeId={activeId}
          isFocused={isFocused}
        />
      ) : null}
    </>
  );
});

const GOOGLE_BOOK = gql`
  query GoogleBook($id: ID!) {
    googleBook(id: $id) {
      etag
      googleId
      authors
      isbn
      publishedAt
      title
      subTitle
      thumbnail
    }
  }
`;

type ListingState = { googleId: string; price: string; description: string };

const onCompleted = ({ createListing }: IMutation) => {
  tracker.event('CREATE_LISTING', { price: createListing.price });
};
const useCreateListing = (listing: ListingState, closeModal) => {
  const client = useApolloClient();
  const [create, { loading, data, error }] = useMutation<IListingInput>(
    CREATE_LISTING,
    {
      variables: {
        googleId: listing.googleId,
        price: parseFloat(listing.price) * 100,
        description: listing.description,
      },
      onCompleted,
      update: (proxy, { data }) => {
        const newListing = data?.createListing;
        if (!newListing) {
          return;
        }

        // best effort update
        try {
          const listingsData = client.readQuery<IQuery>({ query: MY_LISTINGS });
          if (
            !listingsData ||
            !listingsData.me ||
            listingsData.me.__typename !== 'User' ||
            !listingsData.me.listings
          ) {
            return;
          }
          const listings = listingsData.me.listings;
          client.writeQuery({
            query: MY_LISTINGS,
            data: {
              ...listingsData,
              me: {
                ...listingsData.me,
                listings: [newListing, ...listings],
              },
            },
          });
        } catch {}
      },
    },
  );
  return {
    create: React.useCallback(async () => {
      await create();
      closeModal();
    }, [create, closeModal]),
    loading,
    error,
    listing: data?.createListing,
  };
};

const PreviewListing = React.memo<ListingState>(function PreviewListing({
  googleId,
  price,
  description,
}) {
  const { loading, data, error } = useQuery<IQueryGoogleBookArgs>(GOOGLE_BOOK, {
    variables: { id: googleId },
  });

  if (error) {
    return <Error value={error} />;
  }
  if (loading) {
    return <Loading />;
  }

  const googleBook = data?.googleBook;

  const listingPreview: any = {
    book: googleBook,
    price: price === '' ? '' : parseFloat(price) * 100,
    createdAt: new Date(),
    description,
  };

  return <ListingCard listing={listingPreview} />;
});

const initialState = {
  searchValue: '',
  googleId: '',
  price: '',
  description: '',
  isFocused: false,
};
const useListingState = () => {
  const [state, set] = React.useState<
    ListingState & {
      searchValue: string;
      isFocused: boolean;
    }
  >(initialState);

  const pickBook = React.useCallback(
    (book: IGoogleBook) =>
      set(state => ({ ...state, googleId: book.googleId, isFocused: false })),
    [],
  );
  const setPrice = React.useCallback(({ detail }) => {
    if (detail.value) {
      set(state => ({ ...state, price: detail.value }));
    }
  }, []);

  return {
    state,
    pickBook: pickBook,
    onFocus: React.useCallback(
      () => set(state => ({ ...state, isFocused: true })),
      [],
    ),
    setPrice: setPrice,
    setDescription: React.useCallback(({ detail }) => {
      if (detail.value) {
        set(state => ({ ...state, description: detail.value }));
      }
    }, []),
  };
};

export const CreateModal = ({ isOpen, onClose: closeModal }) => {
  const {
    state,
    pickBook,
    setDescription,
    setPrice,
    onFocus,
  } = useListingState();
  const { create, loading, error, listing } = useCreateListing(
    state,
    closeModal,
  );

  const onClick = React.useCallback(
    (e: React.MouseEvent | CustomEvent) => {
      e.stopPropagation();
      e.preventDefault();
      closeModal();
    },
    [closeModal],
  );

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClick}>
      <IonHeader>
        <IonToolbar color="white">
          <Title title="Post Book" homeHref={false} />

          <IonButtons slot="secondary">
            <IonButton onClick={onClick}>
              <IonIcon slot="icon-only" icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Pick a book</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <PickBook
              onClick={pickBook}
              activeId={state.googleId}
              onFocus={onFocus}
              isFocused={state.isFocused}
            />
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Details</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <IonItem>
              <IonLabel>Price</IonLabel>
              <IonIcon icon={logoUsd} size="small" />
              <IonInput
                type="number"
                value={state.price}
                debounce={500}
                onIonChange={setPrice}
               />
            </IonItem>

            <IonItem>
              <IonLabel position="floating">Description</IonLabel>
              <IonTextarea
                value={state.description}
                debounce={500}
                onIonChange={setDescription}
               />
            </IonItem>
          </IonCardContent>
        </IonCard>

        {/* <IonCard>
            <IonCardHeader>
              <IonCardTitle>Upload pictures</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>upload pictures</IonCardContent>
          </IonCard> */}

        {state.googleId ? (
          <PreviewListing {...state} price={state.price} />
        ) : null}

        {error ? <Error value={error} /> : null}
      </IonContent>

      <IonFooter>
        {!listing ? (
          <IonButton
            className="ion-padding-horizontal"
            expand="block"
            onClick={create}
            disabled={!state.googleId || !state.price || loading}
          >
            Create
          </IonButton>
        ) : null}
      </IonFooter>
    </IonModal>
  );
};
