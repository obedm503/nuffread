import { useMutation, useQuery } from '@apollo/react-hooks';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonRow,
  IonTextarea,
  IonThumbnail,
} from '@ionic/react';
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

const onCompleted = ({ createListing }: IMutation) => {
  tracker.event('CREATE_LISTING', { price: createListing.price });
};
const ConfirmListing: React.FC<{
  googleId: string;
  price: number;
  description: string;
  book;
}> = ({ googleId, price, description, book }) => {
  const [create, { loading, data, error }] = useMutation<
    IMutation,
    IListingInput
  >(CREATE_LISTING, {
    variables: {
      googleId,
      price,
      description,
    },
    onCompleted,
  });

  if (error) {
    return <Error value={error}></Error>;
  }
  if (loading) {
    return <Loading></Loading>;
  }

  const listing = Object.assign(
    { book, price, createdAt: new Date() },
    data && data.createListing,
  );
  return (
    <>
      <ListingCard listing={listing} />

      {data ? null : <IonButton onClick={() => create()}>Create</IonButton>}
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
    book?: IGoogleBook;
  }
> {
  state = {
    searchValue: '',
    googleId: '',
    description: '',
    book: undefined,
    price: undefined,
  };

  onPickBook = book => this.setState({ googleId: book.googleId, book });

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
          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeLg="10" offsetLg="1">
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

                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Upload pictures</IonCardTitle>
                  </IonCardHeader>

                  <IonCardContent>upload pictures</IonCardContent>
                </IonCard>

                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Confirm</IonCardTitle>
                  </IonCardHeader>

                  <IonCardContent>
                    {this.state.book ? (
                      <ConfirmListing
                        {...this.state}
                        price={this.state.price || 0}
                      ></ConfirmListing>
                    ) : null}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonModal>
    );
  }
}
