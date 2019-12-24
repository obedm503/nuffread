import { RefresherEventDetail } from '@ionic/core';
import gql from 'graphql-tag';
import * as React from 'react';
import { BASIC_LISTING } from '../queries';
import { IListing, IPaginationInput } from '../schema.gql';
import { useLazyQuery } from '../state/apollo';
import { paginated, queryLoading } from '../util';
import { PaginatedRefresh } from '../util.types';

const TOP_LISTINGS = gql`
  ${BASIC_LISTING}

  query TopListings($offset: Int!) {
    top(paginate: { offset: $offset }) {
      totalCount
      items {
        ...BasicListing

        user {
          id
          name
          email
        }
      }
    }
  }
`;

export const useTopListings = (): PaginatedRefresh<readonly IListing[]> => {
  const [
    load,
    { error, data, loading, fetchMore, called, refetch },
  ] = useLazyQuery<IPaginationInput>(TOP_LISTINGS, {
    variables: { offset: 0 },
  });
  const { totalCount, currentCount } = paginated(data?.top);

  const getMore = React.useCallback(
    async e => {
      await fetchMore({
        variables: { offset: currentCount },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            ...prev,
            top: {
              __typename: 'PaginatedListings',
              totalCount: fetchMoreResult.top.totalCount,
              items: [...prev.top.items, ...fetchMoreResult.top.items],
            },
          };
        },
      });
      (e.target! as HTMLIonInfiniteScrollElement).complete();
    },
    [currentCount, fetchMore],
  );

  const refresh = React.useCallback(
    async (event: CustomEvent<RefresherEventDetail>) => {
      await refetch();
      event.detail.complete();
    },
    [refetch],
  );

  if (error) {
    throw error;
  }

  return {
    load,
    data: data?.top.items,
    loading: queryLoading({ called, loading }),
    canFetchMore: currentCount < totalCount,
    fetchMore: getMore,
    refresh,
  };
};
