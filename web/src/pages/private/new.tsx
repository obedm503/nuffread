import {
  IonCol,
  IonContent,
  IonGrid,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRow,
} from '@ionic/react';
import { range } from 'lodash';
import * as React from 'react';
import { useQuery } from 'react-apollo';
import { RouteComponentProps } from 'react-router';
import { Error, TopNav, WrapLabel } from '../../components';
import { ListWrapper } from '../../components/list-wrapper';
import { BasicListingLoading } from '../../components/listing';
import { SafeImg } from '../../components/safe-img';
import { SearchBar } from '../../components/search-bar';
import { SEARCH_GOOGLE } from '../../queries';
import { IBook, IQuery } from '../../schema.gql';

// const GET_GOOGLE_BOOK = gql`
//   query GetGoogleBook($id: ID!) {
//     googleBook(id: $id) {
//       id
//       isbn
//       thumbnail
//       title
//       subTitle
//       publishedAt
//       authors
//     }
//   }
// `;

// const GoogleBook: React.FC<{ id: string }> = ({ id }) => (
//   <Query<IQuery> query={GET_GOOGLE_BOOK} variables={{ id }}>
//     {({ loading, error, data }) => {
//       if (loading) {
//         return null;
//       }

//       if (error || !data) {
//         return <Error value={error} />;
//       }

//       const googleBook = data.googleBook;
//       if (!googleBook) {
//         return null;
//       }

//       return (
//         <Listing priceColor="success" listing={googleBook}>
//           <IonButton color="primary">Select</IonButton>
//         </Listing>
//       );
//     }}
//   </Query>
// );

type Props = {
  books?: IBook[];
  loading: boolean;
  onClick;
  title?: string;
};

const placeholders = range(10).map(n => <BasicListingLoading key={n} />);

const Book: React.FC<{ onClick?; book: IBook }> = ({ onClick, book }) => (
  <IonItem button={!!onClick} onClick={onClick}>
    <SafeImg
      src={book.thumbnail}
      alt={book.title}
      placeholder="/img/book.png"
      slot="start"
    />
    <WrapLabel>
      {book.title}
      <br />

      {book.subTitle ? (
        <>
          <small>{book.subTitle}</small>
          <br />
        </>
      ) : null}

      <small>{book.authors.join(', ')}</small>
    </WrapLabel>
  </IonItem>
);

class Books extends React.PureComponent<Props> {
  onClick = id => () => {
    this.props.onClick(id);
  };
  render() {
    const { books, loading, title } = this.props;

    if (loading || !Array.isArray(books)) {
      return <ListWrapper title={title}>{placeholders}</ListWrapper>;
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
            <Book key={book.id} onClick={this.onClick(book.id)} book={book} />
          );
        })}
      </ListWrapper>
    );
  }
}

const SearchResults: React.FC<{
  onClick;
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

export class New extends React.PureComponent<
  RouteComponentProps<{ listingId?: string }>,
  { searchValue: string; googleId: string }
> {
  onSearch = searchValue => {
    this.setState({ searchValue });
  };

  onClick = id => {
    this.setState({ googleId: id });
  };

  state = { searchValue: '', googleId: '' };

  render() {
    return (
      <IonPage>
        <TopNav />

        <IonContent>
          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeLg="10" offsetLg="1">
                <SearchBar
                  onSearch={this.onSearch}
                  searchValue={this.state.searchValue}
                />

                {this.state.searchValue ? (
                  <SearchResults
                    onClick={this.onClick}
                    searchValue={this.state.searchValue}
                  />
                ) : (
                  <IonList>
                    <IonItem></IonItem>
                    <IonItem lines="none">
                      <IonLabel>Search for a book</IonLabel>
                    </IonItem>
                  </IonList>
                )}
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
    );
  }
}
