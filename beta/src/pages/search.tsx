import { useRouter } from 'next/router';
import { memo, useCallback } from 'react';
import { useQuery } from '../apollo/client';
import { makeApolloSSR } from '../apollo/ssr';
import { withApollo } from '../apollo/with-apollo';
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

  console.log(router.query);
  const q = router.query?.q;
  const searchValue = Array.isArray(q) ? q[0] : q ?? '';

  const onClick = useCallback(
    (id: string) => {
      router.push(`/b/${id}?q=${searchValue}`, undefined, {
        shallow: true,
      });
    },
    [router, searchValue],
  );

  return {
    searchValue,
    onSearch,
    onClick,
  };
}

const RecentListings = memo<{ onClick: (id: string) => void }>(
  function RecentListings({ onClick }) {
    const { error, loading, data } = useQuery(GET_RECENT_LISTINGS);

    if (error) {
      console.error(error);
      return <div>Something went wrong.</div>;
    }
    if (loading || !data) {
      return <div>loading</div>;
    }
    if (!data.me || data.me.__typename !== 'User') {
      return null;
    }

    return <>{JSON.stringify(data.me.recent, null, 2)}</>;
  },
);

type SearchBooksProps = {
  onClick: (id: string) => void;
  searchValue: string;
};
export const SearchBooks = memo<SearchBooksProps>(function SearchBooks({
  onClick: handleClick,
  searchValue,
}) {
  console.log({ searchValue });
  const { error, data } = useQuery(SEARCH_BOOKS, {
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

  if (error) {
    console.error(error);
    return <div>Something went wrong.</div>;
  }

  return (
    <>
      {JSON.stringify(data?.searchBooks, null, 2)}

      {/* {currentCount < totalCount ? (
        <IonInfiniteScroll onIonInfinite={getMore}>
          {BookBasic.loading}
        </IonInfiniteScroll>
      ) : null} */}
    </>
  );
});

function Search() {
  const { onClick, searchValue } = useSearch();
  return (
    <Layout>
      {searchValue.length ? (
        <SearchBooks onClick={onClick} searchValue={searchValue} />
      ) : (
        <RecentListings onClick={onClick} />
      )}
      <div>{searchValue}</div>
    </Layout>
  );
}

export default withApollo(Search);
export const getServerSideProps = makeApolloSSR(Search);
