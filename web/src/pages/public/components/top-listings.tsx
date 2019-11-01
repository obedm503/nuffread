import gql from 'graphql-tag';
import * as React from 'react';
import { Error } from '../../../components';
import { ListingCard } from '../../../components/listing-card';
import { BASIC_LISTING } from '../../../queries';
import { useQuery } from '../../../state/apollo';
import { Listings } from './listings';

const TOP_LISTINGS = gql`
  ${BASIC_LISTING}

  query TopListings {
    top {
      ...BasicListing
    }
  }
`;

export const TopListings: React.FC<{
  onClick;
}> = ({ onClick }) => {
  const { error, data, loading } = useQuery(TOP_LISTINGS);
  if (error) {
    return <Error value={error} />;
  }
  return (
    <Listings
      loading={loading}
      onClick={onClick}
      listings={data && data.top}
      component={ListingCard}
    />
  );
};
