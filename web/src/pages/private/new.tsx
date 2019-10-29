import { useMutation, useQuery } from '@apollo/react-hooks';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
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
import { CREATE_LISTING, SEARCH_GOOGLE } from '../../queries';
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
const ConfirmListing: React.FC<{
  googleId: string;
  price: number;
  description: string;
}> = ({ googleId, price, description }) => {
  const [
    create,
    { loading: mutLoading, data: mutData, error: mutError },
  ] = useMutation<IMutation, IListingInput>(CREATE_LISTING, {
    variables: {
      googleId,
      price,
      description,
    },
    onCompleted,
  });

  const { loading: qLoading, data: qData, error: qError } = useQuery<IQuery>(
    GOOGLE_BOOK,
    { variables: { googleId } },
  );

  if (qError || mutError) {
    return <Error value={qError || mutError}></Error>;
  }
  if (qLoading || mutLoading) {
    return <Loading></Loading>;
  }

  const googleBook = qData && qData.googleBook;

  const listingPreview = Object.assign(
    { book: googleBook, price, createdAt: new Date() },
    mutData && mutData.createListing,
  );

  return (
    <>
      <ListingCard listing={listingPreview} />

      {mutData ? null : (
        <IonButton expand="block" onClick={() => create()}>
          Create
        </IonButton>
      )}
    </>
  );
};

export class CreateListing extends React.PureComponent<
  { onCancel },
  {
    searchValue: string;
    googleId: string;
    price?: number;
    description: string;
  }
> {
  state = {
    searchValue: '',
    googleId: '',
    description: '',
    price: undefined,
  };

  onPickBook = book => this.setState({ googleId: book.googleId });

  onPriceChange = ({ detail }) => {
    if (detail.value) {
      this.setState({
        price: parseFloat(detail.value) * 100,
      });
    }
  };
  onDescriptionChange = ({ detail }) => {
    if (detail.value) {
      this.setState({ description: detail.value });
    }
  };
  render() {
    const price =
      typeof this.state.price === 'number'
        ? (this.state.price! / 100).toFixed(2)
        : '';
    return (
      <IonModal isOpen>
        <TopNav>
          <IonButtons slot="secondary">
            <IonButton onClick={this.props.onCancel}>
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
                onClick={this.onPickBook}
                activeId={this.state.googleId}
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
                  value={price}
                  debounce={500}
                  onIonChange={this.onPriceChange}
                ></IonInput>
              </IonItem>

              <IonItem>
                <IonLabel position="floating">Description</IonLabel>
                <IonTextarea
                  value={this.state.description}
                  debounce={500}
                  onIonChange={this.onDescriptionChange}
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

          {this.state.googleId ? (
            <ConfirmListing
              {...this.state}
              price={this.state.price || 0}
            ></ConfirmListing>
          ) : null}
        </IonContent>
      </IonModal>
    );
  }
}
