import { RefresherEventDetail } from '@ionic/core';
import gql from 'graphql-tag';
import * as React from 'react';
import { BASIC_LISTING } from '../queries';
import { IPaginationInput } from '../schema.gql';
import { useLazyQuery } from '../state/apollo';
import { queryLoading } from '../util';

const TOP_LISTINGS = gql`
  ${BASIC_LISTING}

  query TopListings($offset: Int!) {
    top(paginate: { offset: $offset }) {
      totalCount
      items {
        ...BasicListing
      }
    }
  }
`;

export const useTopListings = () => {
  const [
    load,
    { error, data, loading, fetchMore, called, refetch },
  ] = useLazyQuery<IPaginationInput>(TOP_LISTINGS, {
    variables: { offset: 0 },
  });
  const currentCount = (data && data.top.items.length) || 0;

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

  const totalCount = (data && data.top.totalCount) || 0;

  return {
    load,
    data: data && data.top.items,
    error,
    loading: queryLoading({ called, loading }),
    canFetchMore: currentCount < totalCount,
    fetchMore: getMore,
    refresh,
  };
};
