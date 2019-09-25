import { useQuery } from '@apollo/react-hooks';
import * as React from 'react';
import { Error } from '../../../components';
import { SEARCH } from '../../../queries';
import { IQuery } from '../../../schema.gql';
import { Listings } from './listings';

export const SearchListings: React.FC<{
  onClick;
  searchValue: string;
}> = ({ onClick, searchValue }) => {
  const { error, data, loading } = useQuery<IQuery>(SEARCH, {
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
    />
  );
};
