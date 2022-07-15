import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useQuery } from '../apollo/client';
import { makeApolloSSR } from '../apollo/ssr';
import { withApollo } from '../apollo/with-apollo';
import { Book, BookPreviews, BookWrapper } from '../components/book-preview';
import { Layout } from '../components/layout';
import {
  Get_Recent_ListingsDocument as GET_RECENT_LISTINGS,
  Search_BooksDocument as SEARCH_BOOKS,
} from '../queries';

function useSearch() {
  const router = useRouter();

  const onSearch = useCallback(
    (value: string | undefined) => {
      router.replace(`/search?q=${value}`, undefined, {
        shallow: true,
      });
    },
    [router],
  );

  const q = router.query?.q;
  const searchValue = Array.isArray(q) ? q[0] : q ?? '';

  return { searchValue, onSearch };
}

function RecentListings() {
  const res = useQuery(GET_RECENT_LISTINGS);

  if (res.error) {
    return <BookPreviews>Something went wrong.</BookPreviews>;
  }
  if (res.loading || !res.data) {
    return null;
  }
  if (!res.data.me || res.data.me.__typename !== 'User') {
    return null;
  }

  return (
    <BookPreviews>
      {res.data.me.recent.map(listing => (
        <BookWrapper key={listing.id}>
          <Book listing={listing} book={listing.book} />
        </BookWrapper>
      ))}
    </BookPreviews>
  );
}

function SearchBooks({ searchValue }: { searchValue: string }) {
  const res = useQuery(SEARCH_BOOKS, {
    variables: { query: searchValue, paginate: { limit: 30, offset: 0 } },
  });
  // const { totalCount, currentCount } = paginatedBooks(data?.searchBooks);

  // const getMore = React.useCallback(
  //   async e => {
  //     await fetchMore({
  //       variables: { query: searchValue, paginate: { offset: currentCount } },
  //       updateQuery: (prev, { fetchMoreResult }) => {
  //         if (!fetchMoreResult) return prev;
  //         return {
  //           ...prev,
  //           searchBooks: {
  //             __typename: 'PaginatedBooks',
  //             totalCount: fetchMoreResult.searchBooks.totalCount,
  //             items: [
  //               ...prev.searchBooks.items,
  //               ...fetchMoreResult.searchBooks.items,
  //             ],
  //           },
  //         };
  //       },
  //     });
  //     (e.target! as HTMLIonInfiniteScrollElement).complete();
  //   },
  //   [currentCount, searchValue, fetchMore],
  // );

  if (res.error) {
    console.error(res.error);
    return <BookPreviews>Something went wrong.</BookPreviews>;
  }

  return (
    <BookPreviews>
      {/* {currentCount < totalCount ? (
          <IonInfiniteScroll onIonInfinite={getMore}>
            {BookBasic.loading}
          </IonInfiniteScroll>
        ) : null} */}
      {res.data?.searchBooks.items.map(book => (
        <BookWrapper key={book.id}>
          <Book book={book} />
        </BookWrapper>
      ))}
    </BookPreviews>
  );
}

function Search() {
  const { searchValue } = useSearch();
  return (
    <Layout title={searchValue ? `Search: ${searchValue}` : 'Search'}>
      {searchValue.length ? (
        <SearchBooks searchValue={searchValue} />
      ) : (
        <RecentListings />
      )}
    </Layout>
  );
}

export default withApollo(Search);
export const getServerSideProps = makeApolloSSR(Search);
