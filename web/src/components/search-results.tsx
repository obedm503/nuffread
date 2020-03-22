import { IonInfiniteScroll } from '@ionic/react';
import gql from 'graphql-tag';
import * as React from 'react';
import { Error } from '.';
import { BASIC_LISTING } from '../queries';
import { IQuerySearchArgs } from '../schema.gql';
import { useQuery } from '../state';
import { paginated } from '../util';
import { ListingBasic } from './listing-basic';
import { Listings } from './listings';

export const SEARCH = gql`
  ${BASIC_LISTING}

  query Search($query: String!, $paginate: PaginationInput!) {
    search(query: $query, paginate: $paginate) {
      totalCount
      items {
        ...BasicListing
      }
    }
  }
`;

type SearchListingsProps = {
  onClick: (id: string) => void;
  searchValue: string;
};
export const SearchListings = React.memo<SearchListingsProps>(
  function SearchListings({ onClick: handleClick, searchValue }) {
    const { error, data, loading, fetchMore } = useQuery<IQuerySearchArgs>(
      SEARCH,
      { variables: { query: searchValue, paginate: { offset: 0 } } },
    );
    const { totalCount, currentCount } = paginated(data?.search);

    const getMore = React.useCallback(
      async e => {
        await fetchMore({
          variables: { query: searchValue, paginate: { offset: currentCount } },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;
            return {
              ...prev,
              search: {
                __typename: 'PaginatedListings',
                totalCount: fetchMoreResult.search.totalCount,
                items: [...prev.search.items, ...fetchMoreResult.search.items],
              },
            };
          },
        });
        (e.target! as HTMLIonInfiniteScrollElement).complete();
      },
      [currentCount, searchValue, fetchMore],
    );

    if (error) {
      return <Error value={error} />;
    }

    return (
      <>
        <Listings
          loading={loading}
          onClick={handleClick}
          listings={data?.search.items}
          title={'Results for: ' + searchValue}
          component={ListingBasic}
        />

        {currentCount < totalCount ? (
          <IonInfiniteScroll onIonInfinite={getMore}>
            {ListingBasic.loading}
          </IonInfiniteScroll>
        ) : null}
      </>
    );
  },
);
