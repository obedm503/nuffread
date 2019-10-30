import { useApolloClient, useMutation, useQuery } from '@apollo/react-hooks';
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
  IonTextarea,
  IonThumbnail,
} from '@ionic/react';
import gql from 'graphql-tag';
import { close, logoUsd } from 'ionicons/icons';
import * as React from 'react';
import { Error, Loading, TopNav } from '../../components';
import { ListWrapper } from '../../components/list-wrapper';
import { ListingBasic } from '../../components/listing-basic';
import { ListingCard } from '../../components/listing-card';
import { SafeImg } from '../../components/safe-img';
import { SearchBar } from '../../components/search-bar';
import { CREATE_LISTING, MY_LISTINGS, SEARCH_GOOGLE } from '../../queries';
import {
  IGoogleBook,
  IListingInput,
  IMutation,
  IQuery,
} from '../../schema.gql';
import { tracker } from '../../state/tracker';

type Props = {
  books?: IGoogleBook[];
  loading: boolean;
  onClick: (book: IGoogleBook) => void;
  title?: string;
  activeId?: string;
};

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
        src={book.thumbnail}
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

class Books extends React.PureComponent<Props> {
  onClick = id => () => {
    this.props.onClick(id);
  };
  render() {
    const { books, loading, title } = this.props;

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

    return (
      <ListWrapper title={title}>
        {books.map(book => {
          if (!book) {
            return null;
          }
          return (
            <Book
              key={book.googleId}
              onClick={this.onClick(book)}
              book={book}
              active={this.props.activeId === book.googleId}
            />
          );
        })}
      </ListWrapper>
    );
  }
}

const SearchResults: React.FC<{
  onClick: (book: IGoogleBook) => void;
  searchValue: string;
  activeId?: string;
}> = ({ onClick, searchValue, activeId }) => {
  const { error, data, loading } = useQuery<IQuery>(SEARCH_GOOGLE, {
    fetchPolicy: 'no-cache',
    variables: { query: searchValue },
  });

  if (error) {
    return <Error value={error} />;
  }

  return (
    <Books
      loading={loading}
      onClick={onClick}
      books={data && data.searchGoogle}
      title={'Results for: ' + searchValue}
      activeId={activeId}
    />
  );
};

const PickBook: React.FC<{
  onClick: (book: IGoogleBook) => void;
  activeId?: string;
}> = ({ onClick, activeId }) => {
  const [searchValue, setSearchValue] = React.useState('');
  return (
    <>
      <SearchBar onSearch={setSearchValue} searchValue={searchValue} />

      {searchValue ? (
        <SearchResults
          onClick={onClick}
          searchValue={searchValue}
          activeId={activeId}
        />
      ) : null}
    </>
  );
};

const GOOGLE_BOOK = gql`
  query GoogleBook($googleId: ID!) {
    googleBook(id: $googleId) {
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
const useCreateListing = (variables, closeModal) => {
  const client = useApolloClient();
  const [create, { loading, data, error }] = useMutation<
    IMutation,
    IListingInput
  >(CREATE_LISTING, {
    variables,
    onCompleted,
    update: (proxy, { data }) => {
      const newListing = data && data.createListing;
      if (!newListing) {
        return;
      }
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
    },
  });
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

const PreviewListing: React.FC<{
  googleId: string;
  price: number;
  description: string;
}> = ({ googleId, price, description }) => {
  const { loading, data, error } = useQuery<IQuery>(GOOGLE_BOOK, {
    variables: { googleId },
  });

  if (error) {
    return <Error value={error}></Error>;
  }
  if (loading) {
    return <Loading></Loading>;
  }

  const googleBook = data && data.googleBook;

  const listingPreview: any = {
    book: googleBook,
    price,
    createdAt: new Date(),
    description,
  };

  return <ListingCard listing={listingPreview} />;
};

const useListingState = () => {
  const [state, set] = React.useState<{
    searchValue: string;
    googleId: string;
    price?: number;
    description: string;
  }>({
    searchValue: '',
    googleId: '',
    description: '',
    price: undefined,
  });

  return {
    state,
    onPickBook: React.useCallback(
      book => set({ ...state, googleId: book.googleId }),
      [state, set],
    ),
    onPriceChange: React.useCallback(
      ({ detail }) => {
        if (detail.value) {
          set({ ...state, price: parseFloat(detail.value) * 100 });
        }
      },
      [state, set],
    ),
    onDescriptionChange: React.useCallback(
      ({ detail }) => {
        if (detail.value) {
          set({ ...state, description: detail.value });
        }
      },
      [state, set],
    ),
  };
};

export const CreateListing = React.memo<{ onCancel }>(({ onCancel }) => {
  const {
    state,
    onPickBook,
    onDescriptionChange,
    onPriceChange,
  } = useListingState();
  const { create, loading, error, listing } = useCreateListing(state, onCancel);

  const price =
    typeof state.price === 'number' ? (state.price! / 100).toFixed(2) : '';
  return (
    <IonModal isOpen onDidDismiss={onCancel}>
      <TopNav>
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
            <PickBook onClick={onPickBook} activeId={state.googleId} />
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
                value={price}
                debounce={500}
                onIonChange={onPriceChange}
              ></IonInput>
            </IonItem>

            <IonItem>
              <IonLabel position="floating">Description</IonLabel>
              <IonTextarea
                value={state.description}
                debounce={500}
                onIonChange={onDescriptionChange}
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
          <PreviewListing {...state} price={state.price || 0} />
        ) : null}

        {error ? <Error value={error} /> : null}
      </IonContent>

      <IonFooter>
        {!listing ? (
          <IonButton
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
});
