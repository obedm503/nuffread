import { IonInfiniteScroll } from '@ionic/react';
import { gql } from '@apollo/client';
import * as React from 'react';
import { Error } from '.';
import { BOOK } from '../queries';
import { IQuerySearchBooksArgs } from '../schema.gql';
import { useQuery } from '../state';
import { paginatedBooks } from '../util';
import { Books } from './books';
import { BookBasic } from './listing-basic';

export const SEARCH_BOOKS = gql`
  ${BOOK}

  query SearchBooks($query: String!, $paginate: PaginationInput!) {
    searchBooks(query: $query, paginate: $paginate) {
      totalCount
      items {
        ...Book
      }
    }
  }
`;

type SearchBooksProps = {
  onClick: (id: string) => void;
  searchValue: string;
};
export const SearchBooks = React.memo<SearchBooksProps>(function SearchBooks({
  onClick: handleClick,
  searchValue,
}) {
  const res = useQuery<IQuerySearchBooksArgs>(SEARCH_BOOKS, {
    variables: { query: searchValue, paginate: { offset: 0 } },
  });
  const { totalCount, currentCount } = paginatedBooks(res.data?.searchBooks);

  const getMore = React.useCallback(
    async e => {
      await res.fetchMore({
        variables: { query: searchValue, paginate: { offset: currentCount } },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            ...prev,
            searchBooks: {
              __typename: 'PaginatedBooks',
              totalCount: fetchMoreResult.searchBooks.totalCount,
              items: [
                ...prev.searchBooks.items,
                ...fetchMoreResult.searchBooks.items,
              ],
            },
          };
        },
      });
      (e.target! as HTMLIonInfiniteScrollElement).complete();
    },
    [currentCount, searchValue, res],
  );

  if (res.error) {
    return <Error value={res.error} />;
  }

  return (
    <>
      <Books
        loading={res.loading}
        onClick={handleClick}
        books={res.data?.searchBooks.items}
        title={'Results for: ' + searchValue}
        component={BookBasic}
      />

      {currentCount < totalCount ? (
        <IonInfiniteScroll onIonInfinite={getMore}>
          {BookBasic.loading}
        </IonInfiniteScroll>
      ) : null}
    </>
  );
});
