import { IonItem, IonLabel } from '@ionic/react';
import React from 'react';
import {
  BookBasic,
  Error,
  ListingBasic,
  ListWrapper,
  SearchBar,
} from '../../../components';
import { SEARCH_GOOGLE } from '../../../queries';
import { IGoogleBook, IQuerySearchGoogleArgs } from '../../../schema.gql';
import { useQuery } from '../../../state/apollo';

const SearchResultBook: React.FC<{
  book: IGoogleBook;
  active: boolean;
  onClick?: () => void;
}> = ({ book, active, onClick: handleClick }) => (
  <BookBasic
    book={book}
    color={active ? 'primary' : undefined}
    onClick={handleClick}
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

export const PickBook = React.memo<{
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
