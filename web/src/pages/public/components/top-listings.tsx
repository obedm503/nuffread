import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import * as React from 'react';
import { Error } from '../../../components';
import { ListingCard } from '../../../components/listing-card';
import { BASIC_LISTING } from '../../../queries';
import { IQuery } from '../../../schema.gql';
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
  const { error, data, loading } = useQuery<IQuery>(TOP_LISTINGS);
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
