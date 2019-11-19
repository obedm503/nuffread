import { IonInfiniteScroll, useIonViewDidEnter } from '@ionic/react';
import gql from 'graphql-tag';
import * as React from 'react';
import { Error } from '../../../components';
import { ListingCard } from '../../../components/listing-card';
import { BASIC_LISTING } from '../../../queries';
import { IPaginationInput } from '../../../schema.gql';
import { useLazyQuery } from '../../../state/apollo';
import { queryLoading } from '../../../util';
import { Listings } from './listings';

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

export const TopListings = React.memo<{
  onClick;
}>(function TopListings({ onClick }) {
  const [load, { error, data, loading, fetchMore, called }] = useLazyQuery<
    IPaginationInput
  >(TOP_LISTINGS, { variables: { offset: 0 } });
  useIonViewDidEnter(load);
  const isLoading = queryLoading({ called, loading });
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

  if (error) {
    return <Error value={error} />;
  }

  const totalCount = (data && data.top.totalCount) || 0;

  return (
    <>
      <Listings
        loading={isLoading}
        onClick={onClick}
        listings={data && data.top.items}
        component={ListingCard}
      />

      {currentCount < totalCount ? (
        <IonInfiniteScroll onIonInfinite={getMore}>
          {ListingCard.loading}
        </IonInfiniteScroll>
      ) : null}
    </>
  );
});
