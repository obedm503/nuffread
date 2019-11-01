import { useQuery } from '@apollo/react-hooks';
import * as React from 'react';
import { Error } from '../../../components';
import { ListingBasic } from '../../../components/listing-basic';
import { SEARCH } from '../../../queries';
import { IQuery, IQuerySearchArgs } from '../../../schema.gql';
import { Listings } from './listings';

export const SearchListings: React.FC<{
  onClick;
  searchValue: string;
}> = ({ onClick, searchValue }) => {
  const { error, data, loading } = useQuery<IQuery, IQuerySearchArgs>(SEARCH, {
    variables: { query: searchValue },
  });
  if (error) {
    return <Error value={error} />;
  }
  return (
    <Listings
      loading={loading}
      onClick={onClick}
      listings={data && data.search}
      title={'Results for: ' + searchValue}
      component={ListingBasic}
    />
  );
};
