import { gql } from '@apollo/client';
import { useRouter } from 'next/router';
import { memo, useCallback } from 'react';
import { makeGetSSP, withGraphQL } from '../apollo-client';
import { Layout } from '../components/layout';
import { BASIC_LISTING, BOOK } from '../queries';
import { IQuerySearchBooksArgs } from '../schema.gql';
import { useQuery } from '../util/apollo';

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

const GET_RECENT_LISTINGS = gql`
  ${BASIC_LISTING}

  query GetRecentListings {
    me {
      ... on User {
        id
        recent {
          ...BasicListing
        }
      }
    }
  }
`;
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
export const SearchBooks = memo<SearchBooksProps>(function SearchBooks({
  onClick: handleClick,
  searchValue,
}) {
  console.log({ searchValue });
  const { error, data, loading, fetchMore } = useQuery<IQuerySearchBooksArgs>(
    SEARCH_BOOKS,
    { variables: { query: searchValue, paginate: { limit: 30, offset: 0 } } },
  );
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
  const { onClick, onSearch, searchValue } = useSearch();
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

export default withGraphQL(Search);
export const getServerSideProps = makeGetSSP(Search);
