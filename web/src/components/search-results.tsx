import { IonInfiniteScroll } from '@ionic/react';
import gql from 'graphql-tag';
import * as React from 'react';
import { Error } from '.';
import { ListingBasic } from './listing-basic';
import { BASIC_LISTING } from '../queries';
import { IQuerySearchArgs } from '../schema.gql';
import { useQuery } from '../state/apollo';
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

export const SearchListings = React.memo<{ onClick; searchValue: string }>(
  function SearchListings({ onClick, searchValue }) {
    const { error, data, loading, fetchMore } = useQuery<IQuerySearchArgs>(
      SEARCH,
      { variables: { query: searchValue, paginate: { offset: 0 } } },
    );
    const currentCount = (data && data.search.items.length) || 0;

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

    const totalCount = (data && data.search.totalCount) || 0;

    return (
      <>
        <Listings
          loading={loading}
          onClick={onClick}
          listings={data && data.search.items}
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
