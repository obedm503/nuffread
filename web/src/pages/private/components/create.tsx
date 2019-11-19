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
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonPage,
  IonTextarea,
  IonThumbnail,
} from '@ionic/react';
import gql from 'graphql-tag';
import { close, logoUsd } from 'ionicons/icons';
import * as React from 'react';
import { Error, Loading, TopNav } from '../../../components';
import { ListWrapper } from '../../../components/list-wrapper';
import { ListingBasic } from '../../../components/listing-basic';
import { ListingCard } from '../../../components/listing-card';
import { SafeImg } from '../../../components/safe-img';
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
import { useRouter } from '../../../state/router';
import { tracker } from '../../../state/tracker';

const Book: React.FC<{ onClick?; book: IGoogleBook; active: boolean }> = ({
  onClick,
  book,
  active,
}) => (
  <IonItem
    button={!!onClick}
    onClick={onClick}
    color={active ? 'primary' : undefined}
  >
    <IonThumbnail slot="start" style={{ '--size': '100%' }}>
      <SafeImg
        src={book.thumbnail || undefined}
        alt={book.title}
        placeholder="/img/book.png"
      />
    </IonThumbnail>
    <IonLabel class="ion-text-wrap">
      {book.title}
      <br />

      {book.subTitle ? (
        <>
          <small>{book.subTitle}</small>
          <br />
        </>
      ) : null}

      <small>{book.authors.join(', ')}</small>
      <br></br>
      <small>{book.isbn.join(', ')}</small>
    </IonLabel>
  </IonItem>
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
  const books = data && data.searchGoogle;

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
        <Book book={activeBook} active />
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
          <Book
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

const onCompleted = ({ createListing }: IMutation) => {
  tracker.event('CREATE_LISTING', { price: createListing.price });
};
const useCreateListing = (listing: IListingInput, closeModal) => {
  const client = useApolloClient();
  const [create, { loading, data, error }] = useMutation<IListingInput>(
    CREATE_LISTING,
    {
      variables: listing,
      onCompleted,
      update: (proxy, { data }) => {
        const newListing = data && data.createListing;
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
    listing: data && data.createListing,
  };
};

const PreviewListing = React.memo<{
  googleId: string;
  price: string;
  description: string;
}>(function PreviewListing({ googleId, price, description }) {
  const { loading, data, error } = useQuery<IQueryGoogleBookArgs>(GOOGLE_BOOK, {
    variables: { id: googleId },
  });

  if (error) {
    return <Error value={error}></Error>;
  }
  if (loading) {
    return <Loading />;
  }

  const googleBook = data && data.googleBook;

  const listingPreview: any = {
    book: googleBook,
    price: parseFloat(price) * 100,
    createdAt: new Date(),
    description,
  };

  return <ListingCard listing={listingPreview} />;
});

const useListingState = () => {
  const [state, set] = React.useState<{
    searchValue: string;
    googleId: string;
    price: string;
    description: string;
    isFocused: boolean;
  }>({
    searchValue: '',
    googleId: '',
    price: '',
    description: '',
    isFocused: false,
  });

  const pickBook = React.useCallback(
    (book: IGoogleBook) =>
      set(state => ({ ...state, googleId: book.googleId, isFocused: false })),
    [set],
  );
  const setPrice = React.useCallback(
    ({ detail }) => {
      if (detail.value) {
        set(state => ({ ...state, price: detail.value }));
      }
    },
    [set],
  );

  return {
    state,
    pickBook: pickBook,
    onFocus: React.useCallback(
      () => set(state => ({ ...state, isFocused: true })),
      [set],
    ),
    setPrice: setPrice,
    setDescription: React.useCallback(
      ({ detail }) => {
        if (detail.value) {
          set(state => ({ ...state, description: detail.value }));
        }
      },
      [set],
    ),
  };
};

export const Create = ({ onCancel }) => {
  const {
    state,
    pickBook,
    setDescription,
    setPrice,
    onFocus,
  } = useListingState();
  const { create, loading, error, listing } = useCreateListing(
    {
      price: parseFloat(state.price) * 100,
      description: state.description,
      googleId: state.googleId,
    },
    onCancel,
  );

  return (
    <>
      <TopNav title="New Listing" homeHref={false}>
        <IonButtons slot="secondary">
          <IonButton onClick={onCancel}>
            <IonIcon slot="icon-only" icon={close}></IonIcon>
          </IonButton>
        </IonButtons>
      </TopNav>

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
              <IonIcon icon={logoUsd} size="small"></IonIcon>
              <IonInput
                type="number"
                value={state.price}
                debounce={500}
                onIonChange={setPrice}
              ></IonInput>
            </IonItem>

            <IonItem>
              <IonLabel position="floating">Description</IonLabel>
              <IonTextarea
                value={state.description}
                debounce={500}
                onIonChange={setDescription}
              ></IonTextarea>
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
    </>
  );
};

export const CreatePage = () => {
  const { history } = useRouter();
  return (
    <IonPage>
      <Create onCancel={history.goBack} />
    </IonPage>
  );
};

export const CreateModal = ({ closeModal }) => {
  return (
    <IonModal isOpen onDidDismiss={closeModal}>
      <Create onCancel={closeModal} />
    </IonModal>
  );
};
