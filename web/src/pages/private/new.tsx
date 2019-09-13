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
  IonPage,
  IonRow,
  IonTextarea,
  IonThumbnail,
} from '@ionic/react';
import { close, logoUsd } from 'ionicons/icons';
import * as React from 'react';
import { useMutation, useQuery } from 'react-apollo';
import { Error, Loading, TopNav } from '../../components';
import { ListWrapper } from '../../components/list-wrapper';
import { BasicListingLoading, Listing } from '../../components/listing';
import { SafeImg } from '../../components/safe-img';
import { SearchBar } from '../../components/search-bar';
import { CREATE_LISTING, SEARCH_GOOGLE } from '../../queries';
import { IGoogleBook, IMutation, IQuery } from '../../schema.gql';

type Props = {
  books?: IGoogleBook[];
  loading: boolean;
  onClick: (book: IGoogleBook) => void;
  title?: string;
};

const Book: React.FC<{ onClick?; book: IGoogleBook }> = ({ onClick, book }) => (
  <IonItem button={!!onClick} onClick={onClick}>
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
      return (
        <ListWrapper title={title}>{BasicListingLoading.list}</ListWrapper>
      );
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
        {books.map((book, i) => {
          if (!book) {
            return null;
          }
          return (
            <Book
              key={book.googleId}
              onClick={this.onClick(book)}
              book={book}
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
}> = ({ onClick, searchValue }) => {
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
    />
  );
};

const PickBook: React.FC<{ onClick: (book: IGoogleBook) => void }> = ({
  onClick,
}) => {
  const [searchValue, setSearchValue] = React.useState('');
  return (
    <>
      <SearchBar onSearch={setSearchValue} searchValue={searchValue} />

      {searchValue ? (
        <SearchResults onClick={onClick} searchValue={searchValue} />
      ) : null}
    </>
  );
};

const CreateListing = ({ googleId, price, description, book }) => {
  const [create, { loading, data, error }] = useMutation<IMutation>(
    CREATE_LISTING,
    {
      variables: {
        googleId,
        price,
        description,
        schoolId: 'f3560244-0fee-4b63-bb79-966a8c04a950',
      },
    },
  );
  if (error) {
    return <Error value={error}></Error>;
  }
  if (loading) {
    return <Loading></Loading>;
  }

  return (
    <>
      <Listing
        listing={Object.assign({ book, price }, data && data.createListing)}
      ></Listing>
      {data ? null : <IonButton onClick={() => create()}>Create</IonButton>}
    </>
  );
};

export class New extends React.PureComponent<
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

  render() {
    console.log(this.state);
    const price =
      typeof this.state.price === 'number'
        ? (this.state.price! / 100).toFixed(2)
        : '';
    return (
      <IonPage>
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
                      onClick={book =>
                        this.setState({ googleId: book.googleId, book })
                      }
                    />
                  </IonCardContent>
                </IonCard>

                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Details</IonCardTitle>
                  </IonCardHeader>

                  <IonCardContent>
                    <IonItem>
                      <IonLabel position="stacked">Price</IonLabel>
                      <IonIcon icon={logoUsd} slot="start"></IonIcon>
                      <IonInput
                        type="number"
                        value={price}
                        debounce={500}
                        onIonChange={({ detail }) => {
                          if (detail.value) {
                            this.setState({
                              price: parseFloat(detail.value) * 100,
                            });
                          }
                        }}
                      ></IonInput>
                    </IonItem>

                    <IonItem>
                      <IonLabel position="floating">Description</IonLabel>
                      <IonTextarea
                        value={this.state.description}
                        debounce={500}
                        onIonChange={({ detail }) => {
                          if (detail.value) {
                            this.setState({ description: detail.value });
                          }
                        }}
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
                      <CreateListing
                        {...this.state}
                        price={this.state.price || ''}
                      ></CreateListing>
                    ) : null}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
    );
  }
}
